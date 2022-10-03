import { IsNotEmpty, IsJWT } from 'class-validator'

export class EmailConfirmationDto {
    @IsNotEmpty()
    @IsJWT()
    token: string;
}