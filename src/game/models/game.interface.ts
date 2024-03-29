import { DecksEntity } from "src/entities/db/decks.entity";

export interface Game {
    id: number;
    name: string;
    description: string;
    extra_roles: boolean;
    extra_teams: boolean;
    grid_rows: number;
    grid_cols: number;
    max_players: number;
    private: boolean;
    status_player: boolean;
    created_at: Date;
    updated_at: Date;
    deck: DecksEntity[] | null;
}