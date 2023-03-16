import { IsNotEmpty } from "class-validator";

export class JoinTable {
    userId: number;

    @IsNotEmpty()
    tableId: number;

    publicUrl: string;
}