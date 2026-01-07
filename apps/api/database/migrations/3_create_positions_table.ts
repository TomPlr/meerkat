import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'positions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.string('wallet_address', 42).notNullable()
      table.string('protocol', 50).notNullable()
      table.integer('chain_id').notNullable().defaultTo(1)
      table.decimal('health_factor', 18, 6).nullable()
      table.jsonb('collateral').notNullable()
      table.jsonb('debt').notNullable()
      table.jsonb('metadata').nullable()
      table.timestamp('snapshot_at', { useTz: true }).notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())

      // Indexes
      table.index(['user_id', 'snapshot_at'], 'positions_user_snapshot_idx')
      table.index(['wallet_address', 'protocol'], 'positions_wallet_protocol_idx')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
