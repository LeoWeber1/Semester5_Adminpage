--
-- PostgreSQL database dump
--

-- Dumped from database version 14.15 (Homebrew)
-- Dumped by pg_dump version 14.15 (Homebrew)

-- Started on 2025-01-14 10:12:19 CET

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
-- TOC entry 210 (class 1259 OID 16481)
-- Name: employees; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.employees (
    id integer NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    id_number character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    last_login timestamp without time zone,
    temperature numeric(4,1),
    threshold_value numeric(4,1) DEFAULT 37.5,
    personal_number character varying(50) NOT NULL
);


ALTER TABLE public.employees OWNER TO admin;

--
-- TOC entry 209 (class 1259 OID 16480)
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
-- TOC entry 3687 (class 0 OID 0)
-- Dependencies: 209
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


--
-- TOC entry 212 (class 1259 OID 16516)
-- Name: users; Type: TABLE; Schema: public; Owner: leopoldweber
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO leopoldweber;

--
-- TOC entry 211 (class 1259 OID 16515)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: leopoldweber
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO leopoldweber;

--
-- TOC entry 3689 (class 0 OID 0)
-- Dependencies: 211
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: leopoldweber
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 3524 (class 2604 OID 16513)
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- TOC entry 3525 (class 2604 OID 16519)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: leopoldweber
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3677 (class 0 OID 16481)
-- Dependencies: 210
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.employees (id, first_name, last_name, id_number, email, last_login, temperature, threshold_value, personal_number) FROM stdin;
1	John	Doe	ID001	john.doe@example.com	2025-01-01 10:00:00	36.5	37.5	PN001
2	Jane	Smith	ID002	jane.smith@example.com	2025-01-02 12:00:00	37.2	37.5	PN002
3	Alice	Johnson	ID003	alice.johnson@example.com	2025-01-03 14:00:00	39.0	37.5	PN003
5	Charlie	Davis	ID005	charlie.davis@example.com	2025-01-04 16:00:00	36.8	37.5	PN005
6	Diana	Evans	ID006	diana.evans@example.com	2025-01-05 18:00:00	39.5	37.5	PN006
7	Eve	Foster	ID007	eve.foster@example.com	2025-01-06 20:00:00	37.8	37.5	PN007
14	1	1	dsa	dsaf@gmail.com	\N	\N	37.5	213
\.


--
-- TOC entry 3679 (class 0 OID 16516)
-- Dependencies: 212
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: leopoldweber
--

COPY public.users (id, username, password, created_at) FROM stdin;
1	1	1	2025-01-14 10:10:05.845048
\.


--
-- TOC entry 3690 (class 0 OID 0)
-- Dependencies: 209
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.employees_id_seq', 14, true);


--
-- TOC entry 3691 (class 0 OID 0)
-- Dependencies: 211
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: leopoldweber
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- TOC entry 3528 (class 2606 OID 16489)
-- Name: employees employees_id_number_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_id_number_key UNIQUE (id_number);


--
-- TOC entry 3530 (class 2606 OID 16491)
-- Name: employees employees_personal_number_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_personal_number_key UNIQUE (personal_number);


--
-- TOC entry 3532 (class 2606 OID 16487)
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- TOC entry 3534 (class 2606 OID 16522)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: leopoldweber
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3536 (class 2606 OID 16524)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: leopoldweber
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 3685 (class 0 OID 0)
-- Dependencies: 3
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: leopoldweber
--

GRANT USAGE ON SCHEMA public TO my_user;
GRANT USAGE ON SCHEMA public TO admin;


--
-- TOC entry 3686 (class 0 OID 0)
-- Dependencies: 210
-- Name: TABLE employees; Type: ACL; Schema: public; Owner: admin
--

GRANT SELECT ON TABLE public.employees TO my_user;


--
-- TOC entry 3688 (class 0 OID 0)
-- Dependencies: 212
-- Name: TABLE users; Type: ACL; Schema: public; Owner: leopoldweber
--

GRANT SELECT ON TABLE public.users TO my_user;


--
-- TOC entry 2030 (class 826 OID 16417)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: leopoldweber
--

ALTER DEFAULT PRIVILEGES FOR ROLE leopoldweber IN SCHEMA public GRANT SELECT ON TABLES  TO my_user;


--
-- TOC entry 2031 (class 826 OID 16465)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE admin IN SCHEMA public GRANT SELECT ON TABLES  TO admin;


-- Completed on 2025-01-14 10:12:19 CET

--
-- PostgreSQL database dump complete
--

