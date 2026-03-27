🌎 Idioma:
- 🇺🇸 [Inglês](README.md)
- 🇧🇷 [Português](README.pt-BR.md)

<p align="center">
      <img src="frontend\public\images\x-ray.png" alt="logo raio-x" width="200">
      <h2 align="center">Registros Raio-x</h2>
</p>

# 🏥 Sistema de Registro de Atendimentos de Raio-X

Este projeto é uma API desenvolvida com **Node.js**, **Express**, **React**, **MySQL**, **HTML** e **CSS**. Ele tem como objetivo otimizar o processo de **registro de atendimentos de pacientes** que realizam exames de raio-x em um hospital.

## 📋 Descrição do sistema

O sistema permite que técnicos de imagem registrem de forma rápida e precisa os atendimentos realizados. Através do **prontuário do paciente**, os dados pessoais (nome, data de nascimento e sexo) são buscados automaticamente de um servidor interno do hospital, facilitando o preenchimento do formulário.

Alé de registrar alguns dados pessoais dos pacientes, também é registrado qual exame foi feito, qual unidade solicitou (Se foi ortopedia, UTI, Clinica médica etc), nome do técnico que realizou, data, horário e algumas outras coisas a mais.

## 🧭 Funcionalidades principais

- 📄 **Formulário de registro** com preenchimento automático via prontuário
- ✅ **Cadastro de atendimentos** com dados do exame e do paciente
- 🕒 **Listagem dos 20 registros mais recentes** com opção de editar ou excluir
- 🔍 **Histórico de atendimentos** com busca filtrada por data
- 📊 **Relatórios avançados** para supervisores, com cards de indicadores e filtros por:
  - Data
  - Origem do paciente
  - Sexo do paciente
  - Tipo de exame
  - Entre outros

## 🛠️ Tecnologias utilizadas

- **Frontend**: React, HTML, CSS
- **Backend**: Node.js, Express
- **Banco de Dados**: MySQL

## 📥 Download

Você pode baixar a versão mais recente do sistema no link abaixo:<br>
👉 [Baixar o instalador (Windows)](https://github.com//lhmontech/Radiology-System/releases/download/v1.0.0/RX_installer_v1.exe)

## Telas
![Tela principal](/frontend/public/images/record-screen.jpg)
![Tela histórico](/frontend/public/images/historic-screen.jpg)
![Tela relatório](/frontend/public/images/report-screen.jpg)

## 🛠️ Desenvolvido por

**👤 Lucas Monteiro**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/lucas-henrique-monteiro-55101a365/?trk=opento_sprofile_topcard)
[![Gmail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:lhmonteiro.ti@gmail.com)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/lhmontech)
