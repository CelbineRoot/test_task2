import {Body, Controller, Get, Post} from "@nestjs/common";
import {UsersService} from "./users.service";

@Controller('/users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Post('/randomUser')
    async create() {
        return this.usersService.createNewRandomUser()
    }

    @Get('/')
    async getAll() {
        return this.usersService.getAllUsers()
    }
}