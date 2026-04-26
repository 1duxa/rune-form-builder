-- Add migration script here
DROP TABLE IF EXISTS form_fields;
DROP TABLE IF EXISTS forms;

CREATE TABLE forms (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    grid_x INT NOT NULL,
    grid_y INT NOT NULL,
    cell_size INT NOT NULL
);

CREATE TABLE form_fields (
    id SERIAL PRIMARY KEY,
    form_id INT NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    x INT NOT NULL,
    y INT NOT NULL,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    label TEXT,
    placeholder TEXT,
    required BOOLEAN DEFAULT FALSE,
    enabled BOOLEAN DEFAULT TRUE,
    visible BOOLEAN DEFAULT TRUE,
    value JSONB DEFAULT '{}'
);

CREATE INDEX idx_form_fields_form_id ON form_fields(form_id);
