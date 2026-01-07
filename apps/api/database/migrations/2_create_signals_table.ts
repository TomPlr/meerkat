import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'signals'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.string('type', 100).notNullable()
      table.string('asset', 20).notNullable()
      table.string('severity', 20).notNullable()
      table.jsonb('data').notNullable()
      table.timestamp('detected_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('expires_at', { useTz: true }).nullable()
      table.string('status', 20).notNullable().defaultTo('active')
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())

      // Indexes
      table.index(['type', 'detected_at'], 'signals_type_detected_idx')
      table.index(['asset', 'status'], 'signals_asset_status_idx')
      table.index(['status', 'detected_at'], 'signals_status_detected_idx')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
