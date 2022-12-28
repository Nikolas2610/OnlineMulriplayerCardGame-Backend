export interface Game {
    id: number;
    name: string;
    description: string;
    dealer: boolean;
    grid_rows: number;
    grid_cols: number;
    max_players: number;
    min_players: number;
    private: boolean;
    rank: boolean;
    status_player: boolean;
    created_at: Date;
    updated_at: Date;
}