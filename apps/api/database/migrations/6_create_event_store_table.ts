import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'event_store'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('event_id').notNullable().unique()
      table.string('event_type', 100).notNullable()
      table.string('aggregate_id', 255).notNullable()
      table.string('aggregate_type', 50).notNullable()
      table.jsonb('data').notNullable()
      table.jsonb('metadata').nullable()
      table.integer('version').notNullable()
      table.timestamp('occurred_at', { useTz: true }).notNullable().defaultTo(this.now())

      // Indexes
      table.index(['aggregate_id', 'version'], 'event_store_aggregate_version_idx')
      table.index(['event_type', 'occurred_at'], 'event_store_event_type_occurred_idx')
      table.index(['aggregate_type'], 'event_store_aggregate_type_idx')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
