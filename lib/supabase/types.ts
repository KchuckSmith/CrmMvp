export type JobStatus =
  | "lead"
  | "bid_sent"
  | "contract_signed"
  | "active"
  | "complete"
  | "lost";

export type BidStatus = "draft" | "sent" | "accepted" | "rejected";

export type ActivityType = "call" | "email" | "site_visit" | "note";

export type ClientSource = "referral" | "web" | "other";

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          company_name: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          source: ClientSource;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          company_name?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          source?: ClientSource;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["clients"]["Insert"]>;
        Relationships: [];
      };
      jobs: {
        Row: {
          id: string;
          user_id: string;
          client_id: string;
          title: string;
          status: JobStatus;
          estimated_value: number | null;
          address: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          client_id: string;
          title: string;
          status?: JobStatus;
          estimated_value?: number | null;
          address?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["jobs"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "jobs_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
        ];
      };
      bids: {
        Row: {
          id: string;
          user_id: string;
          job_id: string;
          amount: number;
          status: BidStatus;
          sent_date: string | null;
          expires_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          job_id: string;
          amount: number;
          status?: BidStatus;
          sent_date?: string | null;
          expires_date?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["bids"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "bids_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
        ];
      };
      contacts: {
        Row: {
          id: string;
          user_id: string;
          client_id: string;
          name: string;
          role: string | null;
          phone: string | null;
          email: string | null;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          client_id: string;
          name: string;
          role?: string | null;
          phone?: string | null;
          email?: string | null;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["contacts"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "contacts_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
        ];
      };
      activity_log: {
        Row: {
          id: string;
          user_id: string;
          job_id: string | null;
          client_id: string | null;
          type: ActivityType;
          body: string;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          job_id?: string | null;
          client_id?: string | null;
          type: ActivityType;
          body: string;
          created_at?: string;
          created_by?: string;
        };
        Update: Partial<Database["public"]["Tables"]["activity_log"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "activity_log_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activity_log_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
        ];
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          job_id: string | null;
          client_id: string | null;
          title: string;
          due_date: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          job_id?: string | null;
          client_id?: string | null;
          title: string;
          due_date?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tasks"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "tasks_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
        ];
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          job_id: string | null;
          client_id: string | null;
          file_name: string;
          file_path: string;
          file_size: number | null;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          job_id?: string | null;
          client_id?: string | null;
          file_name: string;
          file_path: string;
          file_size?: number | null;
          uploaded_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["documents"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "documents_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documents_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
