import React, { useState, useMemo } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const Report = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [records, setRecords] = useState([]);       // Records returned by the current filter query
  const [error, setError] = useState(null);         // Warning/error message shown to the user
  const [exame, setExame] = useState('');
  const [sexo, setSexo] = useState('');
  const [origem, setOrigem] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'datarealizada', direction: 'desc' });

  // Grid column layout for the report table
  const layoutReport = `                     
      minmax(180px, 2.5fr)   
      50px                   
      130px
      80px
      100px
      minmax(180px, 2.5fr)                  
      minmax(100px, 1.2fr)   
      55px                 
      minmax(100px, 1.2fr)   
      65px                  
      minmax(130px, 1.8fr)   
      130px                  
      95px                   
      95px                   
      minmax(150px, 1.5fr)                  
    `;

  // --- HELPER FUNCTIONS ---

  // Converts an ISO date string to Brazilian format (DD/MM/YYYY)
  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR');
  };

  // Calculates the patient's age in full years; returns null if no date provided
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    // Adjust if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  // Maps a birth date to a display age group label for dashboard grouping
  const getAgeGroup = (birthDate) => {
    const age = calculateAge(birthDate);
    if (age === null) return 'N/A';
    if (age <= 13) return `${age} anos`;
    if (age <= 20) return '14 à 20 anos';
    if (age <= 30) return '21 à 30 anos';
    if (age <= 40) return '31 à 40 anos';
    if (age <= 50) return '41 à 50 anos';
    if (age <= 60) return '51 à 60 anos';
    if (age <= 70) return '61 à 70 anos';
    if (age <= 80) return '71 à 80 anos';
    if (age <= 90) return '81 à 90 anos';
    return '+90 anos';
  };

  // Maps an exam name to a broader anatomical category for dashboard grouping
  const getExamCategory = (examName) => {
    const name = (examName || '').toLowerCase();
    if (['tórax', 'esterno', 'costela'].some(v => name.includes(v))) return 'TORAX';
    if (name.includes('abdômen')) return 'ABDOME';
    if (['crânio', 'face', 's. face', 'mandibula', 'órbitas'].some(v => name.includes(v))) return 'CRANIO';
    if (['cervical', 'dorsal', 'lombar', 'sacro', 'coccyx'].some(v => name.includes(v))) return 'COLUNAS';
    if (['clavícula', 'ombro', 'braço', 'cotovelo', 'antebraço', 'punho', 'mão', 'dedo'].some(v => name.includes(v))) return 'M.SUPERIORES';
    if (['bacia', 'quadril', 'fêmur', 'joelho', 'perna', 'tornozelo', 'pé', 'calcâneo'].some(v => name.includes(v))) return 'M.INFERIORES';
    return 'OUTROS';
  };

  // --- DERIVED DATA (MEMOIZED) ---

  // Top-level KPI indicators: total exams, total images (incidences), total re-exposures
  const indicators = useMemo(() => ({
    total: records.length,
    incidences: records.reduce((acc, cur) => acc + (Number(cur.qtdincidencias) || 0), 0),
    reexposures: records.reduce((acc, cur) => acc + (Number(cur.reexposicao) || 0), 0)
  }), [records]);

  // Grouped counts by age range, sex, origin/sector, and exam category for dashboard cards
  const groupings = useMemo(() => {
    const ageMap = {};
    const sexMap = {};
    const originMap = {};
    const examMap = {};

    records.forEach(r => {
      // Age group
      const group = getAgeGroup(r.datanascimento);
      ageMap[group] = (ageMap[group] || 0) + 1;
      // Sex
      const s = r.sexo || 'N/I';
      sexMap[s] = (sexMap[s] || 0) + 1;
      // Origin/sector
      const o = r.origem || 'Não Informado';
      originMap[o] = (originMap[o] || 0) + 1;
      // Exam category
      const cat = getExamCategory(r.exame);
      examMap[cat] = (examMap[cat] || 0) + 1;
    });

    return {
      ages: Object.entries(ageMap),
      sexes: Object.entries(sexMap),
      origins: Object.entries(originMap),
      exams: Object.entries(examMap)
    };
  }, [records]);

  // Sorted copy of records based on current sortConfig (key + direction)
  const sortedRecords = useMemo(() => {
    const sortable = [...records];
    if (sortConfig.key !== null) {
      sortable.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        // Numeric comparison to avoid lexicographic sorting on number strings
        if (!isNaN(valA) && !isNaN(valB)) {
          valA = Number(valA);
          valB = Number(valB);
        }
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [records, sortConfig]);

  // --- ACTIONS ---

  // Fetches filtered records from the API using the current filter state
  const fetchRecords = async () => {
    setError(null);
    try {
      const params = new URLSearchParams({ dataInicio: startDate, dataFim: endDate, exame, sexo, origem, idadeInicio: minAge, idadeFim: maxAge });
      const response = await axios.get(`http://192.168.151.237:3001/api/registros/filtro?${params.toString()}`);
      if (response.data.length === 0) setError("Nenhum registro encontrado para esses filtros.");
      setRecords(response.data);
    } catch (err) {
      setError("Erro ao gerar relatório. Verifique se o servidor está ligado.");
    }
  };

  // Toggles sort direction if clicking the same column; defaults to 'asc' for a new column
  const requestSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Exports the current records as a formatted .xlsx file
  const exportToExcel = () => {
    const formattedRecords = records.map(record => ({
      "Atendimento": record.codatendimento,
      "Nome": record.nomepaciente,
      "Sexo": record.sexo,
      "Idade": calculateAge(record.datanascimento),
      "Classificação": record.classificacao,
      "CID": record.cid,
      "Exame": record.exame,
      "Incidencias": record.qtdincidencias,
      "Origem": record.origem,
      "Data Realização": formatDate(record.datarealizada),
      "Técnico": record.nometecnico,
    }));
    const ws = XLSX.utils.json_to_sheet(formattedRecords);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório");
    XLSX.writeFile(wb, `relatorio_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <div className="page-container" style={{ '--grid-layout': layoutReport }}>
      <h1>Relatórios</h1>

      {/* Warning/error banner — dismissed by clicking X */}
      {error && (
        <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '10px', borderRadius: '5px', marginBottom: '10px', border: '1px solid #ffeeba' }}>
          <strong>Aviso:</strong> {error}
          <button onClick={() => setError(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}>x</button>
        </div>
      )}

      {/* Filter controls: date range, exam type, sex, origin */}
      <div style={{ marginBottom: '20px' }}>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <select value={exame} onChange={(e) => setExame(e.target.value)}>
          <option value="">Exame</option>
          <option value="Abdômen">Abdômen</option>
          <option value="Antebraço">Antebraço</option>
          <option value="Bacia">Bacia</option>
          <option value="Braço">Braço</option>
          <option value="Calcâneo">Calcâneo</option>
          <option value="Cervical">Cervical</option>
          <option value="Clavícula">Clavícula</option>
          <option value="Costela">Costela</option>
          <option value="Cotovelo">Cotovelo</option>
          <option value="Crânio">Crânio</option>
          <option value="Dedo">Dedo</option>
          <option value="Dorsal">Dorsal</option>
          <option value="Esterno">Esterno</option>
          <option value="Face">Face</option>
          <option value="Fêmur">Fêmur</option>
          <option value="Joelho">Joelho</option>
          <option value="Lombar">Lombar</option>
          <option value="Mandibula">Mandibula</option>
          <option value="Mão">Mão</option>
          <option value="Ombro">Ombro</option>
          <option value="Órbitas">Órbitas</option>
          <option value="Pé">Pé</option>
          <option value="Perna">Perna</option>
          <option value="Punho">Punho</option>
          <option value="Quadril">Quadril</option>
          <option value="S. Face">S. Face</option>
          <option value="Sacro">Sacro</option>
          <option value="Tórax">Tórax</option>
          <option value="Tornozelo">Tornozelo</option>
        </select>
        <select name="sexo" value={sexo} onChange={(e) => setSexo(e.target.value)}>
          <option value="">Sexo</option>
          <option value="M">M</option>
          <option value="F">F</option>
        </select>
        <select name="origem" value={origem} onChange={(e) => setOrigem(e.target.value)}>
          <option value="">Origem</option>
          <option value="Ambulatório">Ambulatório</option>
          <option value="Box">Box</option>
          <option value="Clínica Médica">Clínica Médica</option>
          <option value="Clínico">Clínico</option>
          <option value="Externo">Externo</option>
          <option value="Observação">Observação</option>
          <option value="Odontologia">Odontologia</option>
          <option value="Ortopedia">Ortopedia</option>
          <option value="Pediatria">Pediatria</option>
          <option value="UCI">UCI</option>
        </select>
        <button className="search-button" onClick={fetchRecords}>Buscar</button>
        <button className="export-button" onClick={exportToExcel} disabled={records.length === 0}>Exportar para Excel</button>
      </div>

      {/* Dashboard cards — only rendered when there are results */}
      {records.length > 0 && (
        <div className="DashboardContainer">
          {/* KPI indicators */}
          <div className="CardIndicador">
            <span>Nº Solicitações</span>
            <strong>{indicators.total}</strong>
          </div>
          <div className="CardIndicador">
            <span>Nº de imagens</span>
            <strong>{indicators.incidences}</strong>
          </div>
          <div className="CardIndicador">
            <span>Nº Reexposições</span>
            <strong style={{ color: indicators.reexposures > 0 ? '#d9534f' : 'inherit' }}>{indicators.reexposures}</strong>
          </div>

          {/* Grouped breakdown cards */}
          <div className="CardAgrupamento">
            <h4>Por Faixa Etária</h4>
            <ul className="ListaAgrupada">
              {groupings.ages.map(([label, qty]) => (
                <li key={label}><span>{label}</span><strong>{qty}</strong></li>
              ))}
            </ul>
          </div>
          <div className="CardAgrupamento">
            <h4>Por Sexo</h4>
            <ul className="ListaAgrupada">
              {groupings.sexes.map(([label, qty]) => (
                <li key={label}><span>{label}</span><strong>{qty}</strong></li>
              ))}
            </ul>
          </div>
          <div className="CardAgrupamento">
            <h4>Por Categoria de Exame</h4>
            <ul className="ListaAgrupada">
              {groupings.exams.map(([label, qty]) => (
                <li key={label}><span>{label}</span><strong>{qty}</strong></li>
              ))}
            </ul>
          </div>
          <div className="CardAgrupamento">
            <h4>Por Origem/Setor</h4>
            <ul className="ListaAgrupada">
              {groupings.origins.map(([label, qty]) => (
                <li key={label}><span>{label}</span><strong>{qty}</strong></li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Table header row */}
      <form>
        <div className="grid-row grid-header">
          <div style={{ textAlign: 'left' }}>Nome</div>
          <div>Sexo</div>
          <div><span>Data</span><span>Nasc.</span></div>
          <div>Idade</div>
          <div>Classif.</div>
          <div>CID</div>
          <div>Exame</div>
          <div>Inci.</div>
          <div>Origem</div>
          <div>Reexpo.</div>
          <div>Motivo</div>
          <div><span>Data</span><span>Realiz.</span></div>
          <div><span>Hora</span><span>Solic.</span></div>
          <div><span>Hora</span><span>Realiz.</span></div>
          <div>Técnico</div>
        </div>
      </form>

      {/* Records table — uses sortedRecords so column sorting is applied */}
      <div className="table-body">
        {sortedRecords.map((item) => (
          <div key={item.id} className="grid-row grid-data-row">
            <div>{item.nomepaciente}</div>
            <div>{item.sexo}</div>
            <div>{formatDate(item.datanascimento)}</div>
            <div>{calculateAge(item.datanascimento)}</div>
            <div>{item.classificacao}</div>
            <div>{item.cid}</div>
            <div>{item.exame}</div>
            <div>{item.qtdincidencias}</div>
            <div>{item.origem}</div>
            <div>{item.reexposicao}</div>
            <div>{item.motivo}</div>
            <div>{formatDate(item.datarealizada)}</div>
            <div>{item.horapedido}</div>
            <div>{item.horarealizada}</div>
            <div>{item.nometecnico}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Report;