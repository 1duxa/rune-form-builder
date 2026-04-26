-- Add migration script here

drop table if exists testing;

create table testing (
    id serial primary key,
    name text not null,
    int_value int not null,
    decimal_value decimal not null,
    boolean_value bool not null
)
