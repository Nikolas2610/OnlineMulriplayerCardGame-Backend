import { IsNotEmpty } from "class-validator";
import { RankType } from "src/rank/types/rank-type.enum";

export class StoreRankRow {
    points: number | null;

    @IsNotEmpty()
    row: number;

    table_user: number | null;

    type: RankType;

    title: string | null;
}