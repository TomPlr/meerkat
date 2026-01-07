import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'alerts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.uuid('signal_id').nullable().references('id').inTable('signals').onDelete('SET NULL')
      table.string('type', 100).notNullable()
      table.string('channel', 50).notNullable()
      table.text('message').notNullable()
      table.jsonb('metadata').nullable()
      table.timestamp('sent_at', { useTz: true }).nullable()
      table.timestamp('acknowledged_at', { useTz: true }).nullable()
      table.string('status', 20).notNullable().defaultTo('pending')
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())

      // Indexes
      table.index(['user_id', 'status', 'created_at'], 'alerts_user_status_idx')
      table.index(['status', 'created_at'], 'alerts_status_created_idx')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
