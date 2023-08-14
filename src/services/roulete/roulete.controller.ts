import {Body, Controller, Get, Post} from "@nestjs/common";
import {RouleteService} from "./roulete.service";

@Controller('/roulete')
export class RouleteController {
    constructor(private rouleteService: RouleteService) {}

    @Get('/')
    async getGame() {
        return this.rouleteService.getGame()
    }
}