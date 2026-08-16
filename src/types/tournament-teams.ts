export interface Application {
  id: number;
  status: string;
  tournament_id: number;
  tournaments: {
    name: string;
    start_date: string | null;
    end_date: string | null;
    venue: string | null;
  }[] | null;
}