CREATE SEQUENCE IF NOT EXISTS supplyLogs_id_seq;

CREATE TABLE IF NOT EXISTS public."supplyLogs"
(
    id integer NOT NULL DEFAULT nextval('supplyLogs_id_seq'),
    log character varying(255) COLLATE pg_catalog."default",
    action character varying(255) COLLATE pg_catalog."default",
    detail character varying(255) COLLATE pg_catalog."default",
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "userId" integer,
    "supplyId" integer,
    CONSTRAINT "supplyLogs_pkey" PRIMARY KEY (id),
    CONSTRAINT "supplyLogs_supplyId_fkey" FOREIGN KEY ("supplyId")
        REFERENCES public."supplies" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT "supplyLogs_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL
) TABLESPACE pg_default;

ALTER TABLE public."supplyLogs"
    OWNER to postgres;
