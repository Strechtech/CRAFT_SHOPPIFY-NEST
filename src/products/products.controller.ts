import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { Auth, GetUser } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { User } from '../auth/entities/user.entity';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Product } from './entities';



@ApiTags('Productos')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  // METODOS HTTP DE CRUD PARA CREAR PRODUCTOS
  @Post()
  @Auth()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear un producto' })
  @ApiBody({ type: CreateProductDto })
  @ApiCreatedResponse({ description: 'Producto creado', type: Product })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiUnauthorizedResponse({ description: 'Token ausente o inválido' })
  @ApiResponse({ status: 403, description: 'El usuario no tiene permisos' })
  create(
    @Body() createProductDto: CreateProductDto,
    @GetUser() user: User,
  ) {
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Listar productos con paginación' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiResponse({ status: 200, description: 'Productos encontrados', type: [Product] })
  findAll(@Query() paginationDto: PaginationDto) {
    // console.log(paginationDto);
    return this.productsService.findAll(paginationDto);
  }

  @Get(':term')
  @ApiOperation({ summary: 'Buscar un producto por UUID, título o slug' })
  @ApiParam({ name: 'term', description: 'UUID, título exacto o slug del producto' })
  @ApiResponse({ status: 200, description: 'Producto encontrado', type: Product })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  findOne(@Param('term') term: string) {
    return this.productsService.findOne(term);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar un producto como administrador' })
  @ApiParam({ name: 'id', description: 'UUID del producto' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 200, description: 'Producto actualizado exitosamente', type: Product })
  @ApiUnauthorizedResponse({ description: 'Token ausente o inválido' })
  @ApiResponse({ status: 403, description: 'Se requiere el rol admin' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  update(@Param('id', ParseUUIDPipe) id: string,
   @Body() updateProductDto: UpdateProductDto,
   @GetUser() user: User) {
    return this.productsService.update(id, updateProductDto, user);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar un producto como administrador' })
  @ApiParam({ name: 'id', description: 'UUID del producto' })
  @ApiResponse({ status: 200, description: 'Producto eliminado exitosamente' })
  @ApiUnauthorizedResponse({ description: 'Token ausente o inválido' })
  @ApiResponse({ status: 403, description: 'Se requiere el rol admin' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
