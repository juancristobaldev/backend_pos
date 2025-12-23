import { ObjectType, Field, InputType, ID, Float, Int } from '@nestjs/graphql';
import { Order } from './order.entity';



// =========================================================
// 1. OUTPUT TYPE (La Entidad 'Table')
// =========================================================
@ObjectType()
export class Table {
  @Field(() => ID)
  id: string;

  @Field(() => ID,{nullable:true})
  floorId?: string;

  @Field()
  name?: string;

  @Field(() => Float,{nullable:true})
  coordX?: number;

  @Field(() => Float,{nullable:true})
  coordY?: number;

  @Field(() => Int,{nullable:true})
  capacity?: number;

  @Field({nullable:true})
  status?: string;

  @Field({nullable:true})
  shape?: string;

  @Field({nullable:true})
  color?: string;

  @Field({nullable:true})
  createdAt?: Date;

  @Field({nullable:true})
  updatedAt?: Date;

  @Field(() => [Order],{nullable:true})
  orders?: Order[];

  @Field({nullable:true})
  hasActiveOrder?:boolean;
}


// entitys/table.entity.ts
@InputType()
export class ChangeTableStatusInput {
  @Field(() => ID)
  tableId: string;

  @Field()
  newStatus: string;
}


// =========================================================
// 2. INPUT TYPES (Estructuras de Entrada)
// =========================================================

// --- A. DATA INPUT (Datos puros de una mesa, sin floorId) ---
// Este input se usa DENTRO del array de creación masiva.
@InputType()
export class TableDataInput {
  @Field()
  name: string;

  @Field(() => Float)
  coordX: number;

  @Field(() => Float)
  coordY: number;

  @Field(() => Int)
  capacity: number;

  @Field()
  shape: string;

  @Field()
  color: string;

  @Field()
  status: string;
}

// --- B. BATCH INPUT (Input para CREAR MUCHAS mesas) ---
// Este es el que usará tu mutación 'createTables'
@InputType()
export class CreateTablesBatchInput {
  @Field(() => ID)
  floorId: string; // Se envía una sola vez para todo el grupo

  @Field(() => [TableDataInput]) // Array de mesas
  tables: TableDataInput[];
}

// --- C. UPDATE INPUT (Para editar una mesa existente) ---
@InputType()
export class UpdateTableInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field(() => Float, { nullable: true })
  coordX?: number;

  @Field(() => Float, { nullable: true })
  coordY?: number;

  @Field(() => Int, { nullable: true })
  capacity?: number;

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  shape?: string;

  @Field({ nullable: true })
  color?: string;

  @Field(() => ID, { nullable: true })
  floorId?: string;
}

// --- Archivo: table.input.ts (Definiciones de Input para GraphQL) ---

// 1. Input para CREAR una nueva mesa
@InputType()
export class CreateTableInput {
  @Field()
  floorId: string; // FK al plano al que pertenece

  @Field()
  name: string;

  // Usaremos Float para coordenadas, como en tu schema.rtf
  @Field(() => Float)
  coordX: number;

  @Field(() => Float)
  coordY: number;

  @Field()
  capacity: number;

  // Añadimos campos del schema para completar el modelo
  @Field()
  shape: string;

  @Field()
  color: string;
}

// 2. Input para ACTUALIZAR una mesa existente
// Utilizamos PartialType para heredar y hacer opcionales los campos
@InputType()
export class UpdateTableInputArr {
  // El ID es OBLIGATORIO para saber qué mesa actualizar
  @Field()
  id: string;
  @Field()
  coordX: number;
  @Field()
  coordY: number;
  @Field()
  name: string;
}

// 3. Input Principal: La mutación que recibirá el Controller
// Esto permite enviar una sola lista con todas las operaciones
@InputType()
export class TableBatchUpdateInput {
  @Field(() => String, {
    description: 'ID del Floor (Plano) que se está editando.',
  })
  floorId: string;

  @Field(() => [CreateTableInput], {
    nullable: true,
    description: 'Nuevas mesas a crear.',
  })
  tablesToCreate: CreateTableInput[];

  @Field(() => [UpdateTableInputArr], {
    nullable: true,
    description: 'Mesas existentes a actualizar (principalmente coordenadas).',
  })
  tablesToUpdate: UpdateTableInputArr[];

  @Field(() => [String], {
    nullable: true,
    description: 'IDs de las mesas a eliminar.',
  })
  tableIdsToDelete: string[];
}

// --- D. DELETE INPUT (Para eliminar una mesa) ---
@InputType()
export class DeleteTableInput {
  @Field(() => ID)
  id: string;
}
