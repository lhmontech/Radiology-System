import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, SquarePen, Copy } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Record = () => {
  const today = new Date();
  const todayDate = today.toLocaleDateString('pt-BR');

  // Grid column layout for the register table
  const layoutRegister = `    
      35px                  
      minmax(180px, 2.5fr)   
      50px                   
      130px                  
      minmax(100px, 1.2fr)   
      55px                 
      minmax(100px, 1.2fr)   
      65px                  
      minmax(130px, 1.8fr)   
      130px                  
      95px                   
      95px                   
      minmax(150px, 1.5fr)   
      35px                   
      35px                  
    `;

  const defaultReexposure = "Não";

  // Initial state for the form fields
  const initialFormData = {
    codatendimento: '',
    prontuario: '',
    nomepaciente: '',
    sexo: '',
    datanascimento: '',
    classificacao: '',
    cid: '',
    exame: '',
    qtdincidencias: '',
    origem: '',
    reexposicao: defaultReexposure,
    motivo: '',
    datarealizada: todayDate,
    horapedido: '',
    horarealizada: '',
    nometecnico: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState(null);   // ID of the record being edited (null = new record)
  const [message, setMessage] = useState('');          // Feedback message shown to the user
  const [records, setRecords] = useState([]);          // List of recent records shown in the table
  const location = useLocation();

  // Keyboard navigation between form fields using ArrowLeft / ArrowRight
  const handleKeyDown = (e) => {
    const keys = ['ArrowLeft', 'ArrowRight'];
    if (!keys.includes(e.key)) return;

    const selectors = '.CmpProntuario, .search-button, .CmpNome, .CmpSexo, .CmpData, .CmpExame, .CmpInci, .CmpOrigem, .CmpReexp, .CmpMotivo, .CmpHora, .CmpTecnico, .clean-button, .register-button';
    const elements = Array.from(document.querySelectorAll(selectors));
    const currentIndex = elements.indexOf(e.target);

    if (currentIndex === -1) return;

    // Only check cursor position for text-type inputs to avoid interrupting mid-word navigation
    const isCursorCheckable =
      e.target.tagName === 'INPUT' &&
      ['text', 'search', 'password', 'tel', 'url', ''].includes(e.target.type || '');

    if (e.key === 'ArrowRight') {
      // Don't jump if cursor is not at the end of the input
      if (isCursorCheckable && e.target.selectionStart !== e.target.value.length) return;
      e.preventDefault();
      const next = elements[currentIndex + 1];
      if (next) next.focus();
    } else if (e.key === 'ArrowLeft') {
      // Don't jump if cursor is not at the beginning of the input
      if (isCursorCheckable && e.target.selectionStart !== 0) return;
      e.preventDefault();
      const prev = elements[currentIndex - 1];
      if (prev) prev.focus();
    }
  };

  // Generic handler for all controlled form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Populates the form with an existing record's data for editing
  const handleEdit = (item) => {
    const formattedBirthDate = item.datanascimento?.split('T')[0] || "";
    const formattedPerformedDate = item.datarealizada?.split('T')[0] || "";
    setFormData({
      codatendimento: item.codatendimento,
      prontuario: item.prontuario,
      nomepaciente: item.nomepaciente,
      sexo: item.sexo,
      datanascimento: formattedBirthDate,
      classificacao: item.classificacao,
      cid: item.cid,
      exame: item.exame,
      qtdincidencias: item.qtdincidencias,
      origem: item.origem,
      reexposicao: item.reexposicao,
      motivo: item.motivo,
      datarealizada: formattedPerformedDate,
      horapedido: item.horapedido,
      horarealizada: item.horarealizada,
      nometecnico: item.nometecnico
    });
    setEditingId(item.id);
  };

  // Auto-dismiss feedback message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Handles both creating a new record and updating an existing one
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      if (editingId) {
        await axios.put(`http://192.168.151.237:3001/api/registros/${editingId}`, formData);
        setMessage("Sucesso: Registro atualizado!");
      } else {
        await axios.post('http://192.168.151.237:3001/api/registros', formData);
        setMessage("Sucesso: Registro salvo!");
      }
      await fetchRecords();
      setFormData(initialFormData);
      setEditingId(null);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Erro de conexão com o servidor.";
      setMessage(`Erro: ${errorMessage}`);
      console.error('Detailed error:', error);
    }
  };

  // Fetches the 20 most recent records from the API and updates the table
  const fetchRecords = async () => {
    try {
      const res = await axios.get('http://192.168.151.237:3001/api/registros');
      const latestRecords = res.data.slice(0, 20);
      setRecords(latestRecords);
    } catch (err) {
      console.error('Error fetching records:', err);
    }
  };

  // On mount: load records and check if a record was passed for editing via navigation state
  useEffect(() => {
    fetchRecords();
    if (location.state?.registroParaEditar) {
      handleEdit(location.state.registroParaEditar);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Searches for a patient by prontuario (medical record number) and fills the form
  const searchPatient = async () => {
    if (!formData.prontuario) return;
    setMessage("");
    try {
      const response = await axios.get(`http://192.168.151.237:3001/api/registros/prontuario/${formData.prontuario}`);
      const data = response.data;
      const patient = Array.isArray(data) ? data[0] : data;
      setFormData(prev => ({
        ...prev,
        codatendimento: patient.CODATENDIMENTO ?? '',
        prontuario: patient.CODPACIENTE ?? '',
        nomepaciente: patient.NOMEPACIENTE?.trim() ?? '',
        sexo: patient.SEXO ?? '',
        datanascimento: patient.DATANASC?.slice(0, 10) ?? '',
        classificacao: patient.CLASSIFICAÇÃO?.trim() ?? '',
        cid: patient.CID?.trim() ?? ''
      }));
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Prontuário não encontrado ou erro no servidor.";
      setMessage(`Erro: ${msg}`);
    }
    // Move focus to the exam field after patient lookup
    setTimeout(() => {
      document.querySelector('.CmpExame')?.focus();
    }, 0);
  };

  // Deletes a record by ID after user confirmation
  const deleteRecord = async (id) => {
    const confirmed = window.confirm('Tem certeza que deseja excluir este registro?');
    if (!confirmed) return;
    try {
      const response = await axios.delete(`http://192.168.151.237:3001/api/registros/${id}`);
      if (response.status === 200) await fetchRecords();
    } catch (err) {
      setMessage("Erro ao excluir. O servidor pode estar fora do ar.");
    }
  };

  // Pre-fills the form with data from an existing record (without ID), leaving exam blank for a new entry
  const duplicateRecord = (item) => {
    const formattedBirthDate = item.datanascimento?.split('T')[0] || "";
    const formattedPerformedDate = item.datarealizada?.split('T')[0] || "";
    setFormData({
      prontuario: item.prontuario,
      nomepaciente: item.nomepaciente,
      sexo: item.sexo,
      datanascimento: formattedBirthDate,
      exame: '',  // Left blank intentionally so user picks a new exam
      qtdincidencias: item.qtdincidencias,
      origem: item.origem,
      reexposicao: item.reexposicao,
      motivo: item.motivo,
      datarealizada: formattedPerformedDate,
      horapedido: item.horapedido,
      horarealizada: item.horarealizada,
      nometecnico: item.nometecnico
    });
    setEditingId(null);
    setTimeout(() => {
      document.querySelector('.CmpExame')?.focus();
    }, 0);
  };

  // Converts ISO date strings to Brazilian date format (DD/MM/YYYY)
  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="page-container" style={{ '--grid-layout': layoutRegister }} onKeyDown={handleKeyDown}>
      <h1>Registrar Exame</h1>

      {/* Feedback alert: shown on success or error, auto-dismissed after 5s */}
      {message && (
        <div className={`floating-alert ${message.includes('Erro') ? 'error' : 'success'}`}>
          {message}
          <button onClick={() => setMessage("")} className="close-alert">X</button>
        </div>
      )}

      {/* Prontuario lookup form — submitted on Enter or clicking "Buscar" */}
      <form onSubmit={(e) => { e.preventDefault(); searchPatient(); }}>
        Prontuário:
        <input name="prontuario" value={formData.prontuario} onChange={handleChange} />
        <button type="button" onClick={searchPatient} className="search-button">Buscar</button>
      </form>

      {/* Main exam registration form */}
      <form onSubmit={handleSubmit}>

        {/* Table header row */}
        <div className="grid-row grid-header">
          <div style={{ gridColumn: '1 / 3', textAlign: 'left' }}>Nome</div>
          <div>Sexo</div>
          <div><span>Data</span><span>Nasc.</span></div>
          <div>Exame</div>
          <div>Inci.</div>
          <div>Origem</div>
          <div>Reexpo.</div>
          <div>Motivo</div>
          <div><span>Data</span><span>Realiz.</span></div>
          <div><span>Hora</span><span>Solic.</span></div>
          <div><span>Hora</span><span>Realiz.</span></div>
          <div style={{ gridColumn: '13 / 16' }}>Técnico</div>
        </div>

        {/* Input row for new or edited record */}
        <div className="grid-row grid-inputs">
          <input name="nomepaciente" className="CmpNome" style={{ gridColumn: '1 / 3' }} placeholder="Nome" value={formData.nomepaciente} onChange={handleChange} required />
          <select name="sexo" className="CmpSexo" value={formData.sexo} onChange={handleChange}>
            <option value=""></option>
            <option value="M">M</option>
            <option value="F">F</option>
          </select>
          <input name="datanascimento" className="CmpData" type="date" value={formData.datanascimento} onChange={handleChange} />
          <select name="exame" className="CmpExame" value={formData.exame} onChange={handleChange} required>
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
          <select name="qtdincidencias" className="CmpInci" value={formData.qtdincidencias} onChange={handleChange}>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
          <select name="origem" className="CmpOrigem" value={formData.origem} onChange={handleChange} required>
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
          <select name="reexposicao" className="CmpReexp" value={formData.reexposicao} onChange={handleChange}>
            <option value="Não">Não</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
          <input name="motivo" className="CmpMotivo" placeholder="Motivo" value={formData.motivo} onChange={handleChange} />
          <input name="datarealizada" className="CmpData" type="date" value={formData.datarealizada} onChange={handleChange} required />
          <input name="horapedido" className="CmpHora" type="time" value={formData.horapedido} onChange={handleChange} required />
          <input name="horarealizada" className="CmpHora" type="time" value={formData.horarealizada} onChange={handleChange} required />
          <input name="nometecnico" className="CmpTecnico" style={{ gridColumn: '13 / 16' }} placeholder="Técnico" value={formData.nometecnico} onChange={handleChange} required />
        </div>

        <div className="justify-button">
          <button type="button" className="clean-button" onClick={() => setFormData(initialFormData)}>Limpar</button>
          <button type="submit" className="register-button">{editingId ? 'Salvar' : 'Registrar'}</button>
        </div>
      </form>

      {/* Recent records table — shows up to 20 latest entries */}
      <div className="table-body">
        {records.map((item) => (
          <div key={item.id} className="grid-row grid-data-row">
            <button onClick={() => duplicateRecord(item)} className="btn-grid" title="Copiar"><Copy className="icon-grid" /></button>
            <div>{item.nomepaciente}</div>
            <div>{item.sexo}</div>
            <div>{formatDate(item.datanascimento)}</div>
            <div>{item.exame}</div>
            <div>{item.qtdincidencias}</div>
            <div>{item.origem}</div>
            <div>{item.reexposicao}</div>
            <div>{item.motivo}</div>
            <div>{formatDate(item.datarealizada)}</div>
            <div>{item.horapedido}</div>
            <div>{item.horarealizada}</div>
            <div>{item.nometecnico}</div>
            <button onClick={() => handleEdit(item)} className="btn-grid" title="Editar"><SquarePen className="icon-grid" /></button>
            <button onClick={() => deleteRecord(item.id)} className="btn-grid" title="Excluir"><Trash2 className="icon-grid" /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Record;