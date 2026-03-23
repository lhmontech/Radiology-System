import React, { useState } from "react";
import axios from "axios";
import { Trash2, SquarePen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Historic = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [records, setRecords] = useState([]);   // Records returned by the current filter query
  const [error, setError] = useState(null);     // Error message shown to the user
  const navigate = useNavigate();

  // Grid column layout for the history table
  const layoutHistoric = `    
      35px                  
      minmax(180px, 2.5fr)   
      50px                   
      130px
      100px                  
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
    `;

  // Fetches records from the API filtered by the selected date range
  const fetchRecords = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("dataInicio", startDate);
      if (endDate) params.append("dataFim", endDate);

      const response = await axios.get(`/api/registros/filtro?${params.toString()}`);
      setRecords(response.data);
    } catch (err) {
      setError("Não foi possível carregar os registros. Verifique a conexão.");
      console.error("Error fetching records:", err);
    }
  };

  // Navigates to the Registro page passing the selected record for editing
  const navigateToEdit = (item) => {
    navigate('/registro', { state: { registroParaEditar: item } });
  };

  // Deletes a record by ID after user confirmation, then refreshes the list
  const deleteRecord = async (id) => {
    const confirmed = window.confirm("Tem certeza que deseja excluir este registro?");
    if (!confirmed) return;

    try {
      const response = await axios.delete(`/api/registros/${id}`);
      if (response.status === 200) await fetchRecords();
    } catch (err) {
      setError("Erro ao excluir o registro. Tente novamente.");
      console.error("Error deleting record:", err);
    }
  };

  // Converts an ISO date string to Brazilian format (DD/MM/YYYY), respecting UTC to avoid off-by-one day
  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString("pt-BR", { timeZone: 'UTC' });
  };

  // Calculates the patient's age in years based on their birth date
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    // Adjust if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return `${age} anos`;
  };

  return (
    <div className="page-container" style={{ '--grid-layout': layoutHistoric }}>
      <h1>Histórico</h1>

      {/* Error banner — dismissed by clicking X */}
      {error && (
        <div style={{ backgroundColor: '#ffcccc', color: '#cc0000', padding: '10px', borderRadius: '5px', marginBottom: '10px', border: '1px solid #cc0000' }}>
          {error}
          <button onClick={() => setError(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
        </div>
      )}

      {/* Date range filter controls */}
      <div>
        Data Inicial:
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        Data Final:
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button className="search-button" onClick={fetchRecords}>
          Buscar
        </button>
      </div>

      <form>
        {/* Table header row */}
        <div className="grid-row grid-header">
          <div style={{ gridColumn: '1 / 3', textAlign: 'left' }}>Nome</div>
          <div>Sexo</div>
          <div><span>Data</span><span>Nasc.</span></div>
          <div>Idade</div>
          <div>Exame</div>
          <div>Inci.</div>
          <div>Origem</div>
          <div>Reexpo.</div>
          <div>Motivo</div>
          <div><span>Data</span><span>Realiz.</span></div>
          <div><span>Hora</span><span>Solic.</span></div>
          <div><span>Hora</span><span>Realiz.</span></div>
          <div style={{ gridColumn: '14 / 16' }}>Técnico</div>
        </div>
      </form>

      {/* Records table — populated after a date range search */}
      <div className="table-body">
        {records.map((item) => (
          <div key={item.id} className="grid-row grid-data-row">
            <button onClick={() => navigateToEdit(item)} className="btn-grid" title="Editar"><SquarePen className="icon-grid" /></button>
            <div className="col-nome-data">{item.nomepaciente}</div>
            <div>{item.sexo}</div>
            <div>{formatDate(item.datanascimento)}</div>
            <div>{item.exame}</div>
            <div>{item.qtdincidencias}</div>
            <div>{item.origem}</div>
            <div>{item.reexposicao}</div>
            <div>{item.motivo}</div>
            <div>{formatDate(item.datarealizada)}</div>
            <div>{calculateAge(item.datanascimento)}</div>
            <div>{item.horapedido}</div>
            <div>{item.horarealizada}</div>
            <div>{item.nometecnico}</div>
            <button onClick={() => deleteRecord(item.id)} className="btn-grid" title="Excluir"><Trash2 className="icon-grid" /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Historic;