import { IsNotEmpty } from "class-validator";
import { CreateCardDto } from "./CreateCard.dto";

export class EditCardDto extends CreateCardDto {
    @IsNotEmpty()
    id: string;
}