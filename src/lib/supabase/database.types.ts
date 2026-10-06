// Tipe tabel sesuai supabase/migrations/.
// Ditulis manual dengan format yang sama seperti hasil `supabase gen types typescript`.
// Kalau skema berubah, perbarui file ini (atau generate ulang) di PR yang sama dengan migrasinya.

export type Peran = "pasien" | "pmo" | "nakes";
export type StatusCheckin = "menunggu" | "terverifikasi" | "ditolak";
export type TingkatEfekSamping = "ringan" | "sedang" | "berat";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nama: string;
          peran: Peran;
          created_at: string | null;
        };
        Insert: {
          id: string;
          nama: string;
          peran: Peran;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          nama?: string;
          peran?: Peran;
          created_at?: string | null;
        };
        Relationships: [];
      };
      pasien: {
        Row: {
          id: string;
          profile_id: string;
          pmo_id: string | null;
          nakes_id: string;
          tanggal_mulai: string;
          durasi_hari: number;
          jam_minum: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          pmo_id?: string | null;
          nakes_id: string;
          tanggal_mulai: string;
          durasi_hari?: number;
          jam_minum: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          pmo_id?: string | null;
          nakes_id?: string;
          tanggal_mulai?: string;
          durasi_hari?: number;
          jam_minum?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pasien_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pasien_pmo_id_fkey";
            columns: ["pmo_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pasien_nakes_id_fkey";
            columns: ["nakes_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      checkin: {
        Row: {
          id: string;
          pasien_id: string;
          tanggal: string;
          media_path: string | null;
          status: StatusCheckin;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          pasien_id: string;
          // Wajib diisi tanggal WIB dari aplikasi (lihat src/lib/tanggal.ts)
          tanggal: string;
          media_path?: string | null;
          status?: StatusCheckin;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          pasien_id?: string;
          tanggal?: string;
          media_path?: string | null;
          status?: StatusCheckin;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "checkin_pasien_id_fkey";
            columns: ["pasien_id"];
            isOneToOne: false;
            referencedRelation: "pasien";
            referencedColumns: ["id"];
          },
        ];
      };
      efek_samping: {
        Row: {
          id: string;
          pasien_id: string;
          jenis: string;
          tingkat: TingkatEfekSamping;
          catatan: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          pasien_id: string;
          jenis: string;
          tingkat: TingkatEfekSamping;
          catatan?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          pasien_id?: string;
          jenis?: string;
          tingkat?: TingkatEfekSamping;
          catatan?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "efek_samping_pasien_id_fkey";
            columns: ["pasien_id"];
            isOneToOne: false;
            referencedRelation: "pasien";
            referencedColumns: ["id"];
          },
        ];
      };
      tindak_lanjut: {
        Row: {
          id: string;
          pasien_id: string;
          nakes_id: string;
          catatan: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          pasien_id: string;
          nakes_id: string;
          catatan: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          pasien_id?: string;
          nakes_id?: string;
          catatan?: string;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "tindak_lanjut_pasien_id_fkey";
            columns: ["pasien_id"];
            isOneToOne: false;
            referencedRelation: "pasien";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tindak_lanjut_nakes_id_fkey";
            columns: ["nakes_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

type TabelPublik = Database["public"]["Tables"];

// Helper singkat: Tables<"checkin"> = tipe satu baris checkin
export type Tables<T extends keyof TabelPublik> = TabelPublik[T]["Row"];
export type TablesInsert<T extends keyof TabelPublik> = TabelPublik[T]["Insert"];
export type TablesUpdate<T extends keyof TabelPublik> = TabelPublik[T]["Update"];
