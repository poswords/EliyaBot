CREATE TABLE teams (
  id serial,
  dungeon varchar(4096),
  description text DEFAULT  'No Description',
  url varchar(4096),

  cards text[],
  unison text[],

  weapons text[],
  souls text[],

  creator varchar(4096),
  voters  text[],
  voter_score integer DEFAULT 1,
  tags  text[],
  PRIMARY KEY (id),
  UNIQUE (dungeon, url)

);
