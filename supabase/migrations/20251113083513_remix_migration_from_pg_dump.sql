--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;


--
-- Name: handle_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.profiles REPLICA IDENTITY FULL;


--
-- Name: prompt_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prompt_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    text text NOT NULL,
    is_default boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.prompt_templates REPLICA IDENTITY FULL;


--
-- Name: saved_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.saved_configs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    prompt text NOT NULL,
    topic text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.saved_configs REPLICA IDENTITY FULL;


--
-- Name: submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    prompt text NOT NULL,
    topic text NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    status text DEFAULT 'success'::text
);

ALTER TABLE ONLY public.submissions REPLICA IDENTITY FULL;


--
-- Name: webhooks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.webhooks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    url text NOT NULL,
    events text[] DEFAULT '{}'::text[] NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.webhooks REPLICA IDENTITY FULL;


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: prompt_templates prompt_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prompt_templates
    ADD CONSTRAINT prompt_templates_pkey PRIMARY KEY (id);


--
-- Name: saved_configs saved_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_configs
    ADD CONSTRAINT saved_configs_pkey PRIMARY KEY (id);


--
-- Name: saved_configs saved_configs_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_configs
    ADD CONSTRAINT saved_configs_user_id_key UNIQUE (user_id);


--
-- Name: submissions submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_pkey PRIMARY KEY (id);


--
-- Name: webhooks webhooks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhooks
    ADD CONSTRAINT webhooks_pkey PRIMARY KEY (id);


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: prompt_templates update_prompt_templates_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_prompt_templates_updated_at BEFORE UPDATE ON public.prompt_templates FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: saved_configs update_saved_configs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_saved_configs_updated_at BEFORE UPDATE ON public.saved_configs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: webhooks update_webhooks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON public.webhooks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: prompt_templates prompt_templates_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prompt_templates
    ADD CONSTRAINT prompt_templates_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: saved_configs saved_configs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_configs
    ADD CONSTRAINT saved_configs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: submissions submissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles Users can delete their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own profile" ON public.profiles FOR DELETE USING ((auth.uid() = id));


--
-- Name: prompt_templates Users can delete their own templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own templates" ON public.prompt_templates FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: webhooks Users can delete their own webhooks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own webhooks" ON public.webhooks FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: saved_configs Users can insert their own config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own config" ON public.saved_configs FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: submissions Users can insert their own submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own submissions" ON public.submissions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: prompt_templates Users can insert their own templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own templates" ON public.prompt_templates FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: webhooks Users can insert their own webhooks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own webhooks" ON public.webhooks FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: saved_configs Users can update their own config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own config" ON public.saved_configs FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: prompt_templates Users can update their own templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own templates" ON public.prompt_templates FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: webhooks Users can update their own webhooks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own webhooks" ON public.webhooks FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: saved_configs Users can view their own config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own config" ON public.saved_configs FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: submissions Users can view their own submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own submissions" ON public.submissions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: prompt_templates Users can view their own templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own templates" ON public.prompt_templates FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: webhooks Users can view their own webhooks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own webhooks" ON public.webhooks FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: prompt_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: saved_configs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.saved_configs ENABLE ROW LEVEL SECURITY;

--
-- Name: submissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

--
-- Name: webhooks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


