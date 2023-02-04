export interface CreateGame {
    name: string;
    description: string | null;
    extra_roles: boolean;
    extra_teams: boolean;
    grid_rows: number;
    grid_cols: number;
    max_players: number;
    min_players: number;
    private: boolean;
    rank: boolean;
    status_player: boolean;
}