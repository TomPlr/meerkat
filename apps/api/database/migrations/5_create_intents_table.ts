import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'intents'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.string('name', 255).notNullable()
      table.jsonb('condition').notNullable()
      table.jsonb('action').notNullable()
      table.string('status', 20).notNullable().defaultTo('active')
      table.timestamp('triggered_at', { useTz: true }).nullable()
      table.timestamp('executed_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())

      // Indexes
      table.index(['user_id', 'status'], 'intents_user_status_idx')
      table.index(['status', 'triggered_at'], 'intents_status_triggered_idx')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
