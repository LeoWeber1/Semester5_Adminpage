--
-- PostgreSQL database dump
--

-- Dumped from database version 14.15 (Homebrew)
-- Dumped by pg_dump version 14.15 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: employees; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.employees (
    id integer NOT NULL,
    first_name character varying(50),
    last_name character varying(50),
    phone character varying(50),
    email character varying(100),
    last_login date,
    temperature numeric(4,2),
    role character varying(50)
);


ALTER TABLE public.employees OWNER TO admin;

--
-- Name: employees_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.employees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.employees_id_seq OWNER TO admin;

--
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(50) NOT NULL
);


ALTER TABLE public.users OWNER TO admin;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO admin;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.employees (id, first_name, last_name, phone, email, last_login, temperature, role) FROM stdin;
1	Lian	Smith	622322662	lian.smith@mail.com	2023-10-12	37.50	Manager
2	Emma	Johnson	622322663	emma.johnson@mail.com	2023-10-10	38.00	Developer
3	Oliver	Williams	622322664	oliver.williams@mail.com	2023-10-09	40.50	Designer
4	Isabella	Brown	622322665	isabella.brown@mail.com	2023-10-08	55.50	Tester
5	Lian	Smith	622322662	lian.smith@mail.com	2023-10-12	37.50	Manager
6	Emma	Johnson	622322663	emma.johnson@mail.com	2023-10-10	38.00	Developer
7	Oliver	Williams	622322664	oliver.williams@mail.com	2023-10-09	40.50	Designer
8	Isabella	Brown	622322665	isabella.brown@mail.com	2023-10-08	55.50	Tester
9	Isabella	Brown	622322665	isabella.brown@mail.com	2023-10-08	55.50	Tester
10	Lian	Smith	622322662	lian.smith@mail.com	2023-10-28	37.50	Manager
11	Emma	Johnson	622322663	emma.johnson@mail.com	2023-10-27	38.00	Developer
12	Oliver	Williams	622322664	oliver.williams@mail.com	2023-10-26	40.50	Designer
13	Isabella	Brown	622322665	isabella.brown@mail.com	2023-10-25	55.50	Tester
14	Lian	Smith	622322662	lian.smith@mail.com	2023-10-24	37.50	Manager
15	Emma	Johnson	622322663	emma.johnson@mail.com	2023-07-23	38.00	Developer
16	Oliver	Williams	622322664	oliver.williams@mail.com	2023-07-22	40.50	Designer
17	Isabella	Brown	622322665	isabella.brown@mail.com	2023-08-21	55.50	Tester
18	Lian	Smith	622322662	lian.smith@mail.com	2023-09-20	37.50	Manager
19	Emma	Johnson	622322663	emma.johnson@mail.com	2023-10-19	38.00	Developer
20	Oliver	Williams	622322664	oliver.williams@mail.com	2023-10-18	40.50	Designer
21	Isabella	Brown	622322665	isabella.brown@mail.com	2023-10-17	55.50	Tester
22	Lian	Smith	622322662	lian.smith@mail.com	2023-10-16	37.50	Manager
23	Emma	Johnson	622322663	emma.johnson@mail.com	2023-10-15	38.00	Developer
24	Oliver	Williams	622322664	oliver.williams@mail.com	2023-10-14	40.50	Designer
25	Isabella	Brown	622322665	isabella.brown@mail.com	2023-10-13	55.50	Tester
26	Lian	Smith	622322662	lian.smith@mail.com	2023-10-12	37.50	Manager
27	Emma	Johnson	622322663	emma.johnson@mail.com	2023-10-11	38.00	Developer
28	Oliver	Williams	622322664	oliver.williams@mail.com	2023-10-10	40.50	Designer
29	Isabella	Brown	622322665	isabella.brown@mail.com	2023-10-09	55.50	Tester
30	Lian	Smith	622322662	lian.smith@mail.com	2023-10-08	37.50	Manager
31	Emma	Johnson	622322663	emma.johnson@mail.com	2023-10-07	38.00	Developer
32	Oliver	Williams	622322664	oliver.williams@mail.com	2023-10-06	40.50	Designer
33	Isabella	Brown	622322665	isabella.brown@mail.com	2023-10-05	55.50	Tester
34	Lian	Smith	622322662	lian.smith@mail.com	2023-10-04	37.50	Manager
35	Emma	Johnson	622322663	emma.johnson@mail.com	2023-10-03	38.00	Developer
36	Oliver	Williams	622322664	oliver.williams@mail.com	2023-10-02	40.50	Designer
37	Isabella	Brown	622322665	isabella.brown@mail.com	2023-10-01	55.50	Tester
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.users (id, username, password) FROM stdin;
1	adminadmin	adminadmin
2	admina	12345
3	user1	password1
4	user2	password2
5	testuser	password123
6	dsaf	dsaf
7	leo	111
8	bla	1
\.


--
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.employees_id_seq', 37, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.users_id_seq', 7, true);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: admin
--

GRANT USAGE ON SCHEMA public TO admin;


--
-- Name: TABLE employees; Type: ACL; Schema: public; Owner: admin
--

GRANT ALL ON TABLE public.employees TO admin;


--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: admin
--

GRANT SELECT ON TABLE public.users TO admin;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE admin IN SCHEMA public GRANT SELECT ON TABLES  TO admin;


--
-- PostgreSQL database dump complete
--

