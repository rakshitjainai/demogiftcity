CREATE TABLE candidates (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  candidate_code VARCHAR(32) NOT NULL,
  name VARCHAR(120) NOT NULL,
  mobile VARCHAR(30) NOT NULL,
  email VARCHAR(190) NOT NULL,
  role VARCHAR(120) NULL,
  experience VARCHAR(60) NULL,
  interview_timing VARCHAR(80) NULL,
  access_token_hash CHAR(64) NOT NULL,
  current_page VARCHAR(60) DEFAULT 'home',
  current_section VARCHAR(80) NULL,
  current_index INT DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_active DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_candidate_code (candidate_code),
  UNIQUE KEY uq_email (email),
  KEY idx_last_active (last_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE activity (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  candidate_id BIGINT UNSIGNED NOT NULL,
  event_name VARCHAR(80) NOT NULL,
  section_name VARCHAR(80) NULL,
  item_index INT NULL,
  item_title VARCHAR(255) NULL,
  score DECIMAL(6,2) NULL,
  metadata_json TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_candidate (candidate_id),
  KEY idx_event (event_name),
  CONSTRAINT fk_activity_candidate FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
