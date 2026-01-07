import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.string('wallet_address', 42).notNullable().unique()
      table.jsonb('preferences').nullable()
      table.string('telegram_chat_id', 255).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())

      // Indexes
      table.index(['wallet_address'], 'users_wallet_address_idx')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
