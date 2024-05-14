/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon, PokemonSchema } from './entities/pokemon.entity';
import { Model, isValidObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ) {

  }
  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    try {
      console.log("Hola")
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon
    } catch (error) {
      this.handleExceptions(error)
    }

  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {
    let pokemon: Pokemon;
    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: term })
    }

    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term)
    }

    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: term.toLocaleLowerCase().trim() })
    }


    if (!pokemon) throw new NotFoundException(`Pokemon with id, name or no ${term} not found`);

    return pokemon
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    try {
      const pokemon = await this.findOne(term);
      if (updatePokemonDto.name) updatePokemonDto.name.toLocaleLowerCase();
      await pokemon.updateOne(updatePokemonDto);
      return { ...pokemon.toJSON(), ...updatePokemonDto };
    }catch(error){
      this.handleExceptions(error)

    }
    

  }

 async remove(id: string) {
    // try{
      const pokemon = await this.pokemonModel.deleteOne({_id: id})
      if(!pokemon.deletedCount) throw new NotFoundException(`Pokemon with id ${id} not found`);

      return {
        message: 'Pokemon with id ${id} deleted successfully',
        pokemon
      };
      
    
      
    // }catch(error){
    //   this.handleExceptions(error)
    // }
  }

  private handleExceptions (error: any){
    if(error.code === 11000) throw new NotFoundException(`Pokemon exist in the database ${JSON.stringify(error.keyValue)}`);
      throw new InternalServerErrorException(`Can't update Pokemon - Check server logs`)
  }
}
