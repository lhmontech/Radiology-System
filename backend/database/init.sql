-- Criar banco bdraiox
DROP DATABASE IF EXISTS `bdraiox`;
CREATE DATABASE `bdraiox` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `bdraiox`;

-- Criar tabela registros
DROP TABLE IF EXISTS `registros`;
CREATE TABLE `registros` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `codatendimento` SMALLINT DEFAULT NULL,
  `prontuario` INT DEFAULT NULL,
  `nomepaciente` VARCHAR(100) DEFAULT NULL,
  `sexo` VARCHAR(10) DEFAULT NULL,
  `datanascimento` DATE DEFAULT NULL,
  `classificacao` VARCHAR(20) DEFAULT NULL,
  `cid` VARCHAR(400) DEFAULT NULL,
  `exame` VARCHAR(100) DEFAULT NULL,
  `qtdincidencias` INT DEFAULT NULL,
  `origem` VARCHAR(50) DEFAULT NULL,
  `reexposicao` VARCHAR(20) DEFAULT 'Não',
  `motivo` VARCHAR(50) DEFAULT NULL,
  `datarealizada` DATE DEFAULT NULL,
  `horapedido` TIME DEFAULT NULL,
  `horarealizada` TIME DEFAULT NULL,
  `nometecnico` VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dados iniciais bdraiox
INSERT INTO `registros` VALUES 
(1,2,22222,'JESSICA MARIANE APARECIDA RIBEIRO KIKO','F','1992-11-01','AMARELO','J12 - Pneumonia viral não classificada em outra parte','Órbitas',2,'Ortopedia','Não','','2025-05-19','10:57:00','15:13:00','TALITA'),
(2,3,232355,'GILSON DEMETRIO LIMA','M','1980-06-04','VERMELHO', 'N/A - CID NÃO PREENCHIDO PELO MÉDICO','Crânio',2,'Ortopedia','Não','','2025-05-19','17:00:00','17:30:00','LUCAS HENRIQUE'),
(3,5,696562,'NARCISO FRANKIN SANT ANA','M','1945-03-02','AZUL','J069 - Infecção aguda das vias aéreas superiores não especificada','Tórax',1,'Clínico','','','2025-05-16','18:46:00','19:35:00','LEANDRO F');

-- Criar banco corpore
DROP DATABASE IF EXISTS `corpore`;
CREATE DATABASE `corpore` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `corpore`;

-- Criar tabela szpaciente
DROP TABLE IF EXISTS `szpaciente`;
CREATE TABLE `szpaciente` (
  `prontuario` INT NOT NULL AUTO_INCREMENT,
  `codatendimento` INT DEFAULT NULL,
  `classificacao` VARCHAR(20) DEFAULT NULL,
  `cid` VARCHAR(400) DEFAULT NULL,
  `nome` VARCHAR(100) NOT NULL,
  `datanascimento` DATE DEFAULT NULL,
  `sexo` VARCHAR(20) DEFAULT NULL,
  `estadocivil` VARCHAR(20) DEFAULT NULL,
  `naturalidade` VARCHAR(100) DEFAULT NULL,
  `telefone` VARCHAR(30) DEFAULT NULL,
  PRIMARY KEY (`prontuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dados iniciais corpore
INSERT INTO `szpaciente` VALUES 
(1,1,'AMARELO','FK00 - Só quer atestado','Ana Carolina Souza','1990-04-15','F','Solteiro(a)','São Paulo','(11) 98765-4321'),
(2,3,'VERDE','A203 - Câncer terminal','João Pedro Almeida','1985-09-23','M','Casado(a)','Campinas','(19) 99876-5432');
