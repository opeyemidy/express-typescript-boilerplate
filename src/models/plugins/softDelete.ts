import { Schema, Model } from "mongoose"

interface SoftDeleteOptions {
    deletedAtFieldName?: string
}

interface SoftDeleteDocument {
    deletedAt?: Date
    delete(): Promise<void>
    restore(): Promise<void>
}

interface SoftDeleteModel<T extends SoftDeleteDocument> extends Model<T> {
    deleteById(id: unknown): Promise<void>
    restoreById(id: unknown): Promise<void>
    findDeleted(
        conditions?: unknown,
        projection?: unknown,
        options?: unknown
    ): Promise<T[]>
}
interface CustomSchema extends Schema {
    options: SoftDeleteOptions
}
const softDeletePlugin = (schema: CustomSchema) => {
    const deletedAtFieldName = schema.options.deletedAtFieldName || "deletedAt"

    return (schema: Schema) => {
        schema.add({ [deletedAtFieldName]: { type: Date, default: null } })

        schema.methods.delete = async function () {
            this.set(deletedAtFieldName, new Date())
            await this.save()
        }

        schema.methods.restore = async function () {
            this.set(deletedAtFieldName, null)
            await this.save()
        }

        schema.statics.deleteById = async function (id: unknown) {
            const doc = await this.findById(id)
            if (doc) {
                await doc.delete()
            }
        }

        schema.statics.restoreById = async function (id: unknown) {
            const doc = await this.findById(id)
            if (doc) {
                await doc.restore()
            }
        }

        schema.statics.findDeleted = function (
            conditions?: object,
            projection?: unknown,
            options?: unknown
        ) {
            return this.find(
                { [deletedAtFieldName]: { $ne: null }, ...conditions },
                projection,
                options
            )
        }
    }
}

export {
    // SoftDeleteOptions,
    SoftDeleteDocument,
    SoftDeleteModel,
    softDeletePlugin,
}
