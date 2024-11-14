import { Schema, Document } from "mongoose"

interface PrivateOption {
    private: boolean
}

type IRet = { [key: string]: unknown }
interface ToJSONOption {
    virtuals: true
    transform?: (doc: Document, ret: IRet, options: ToJSONOption) => unknown
    exclude?: string[]
}

interface CustomSchema extends Schema {
    options: {
        toJSON?: ToJSONOption & {
            transform: (
                doc: Document,
                ret: IRet,
                options: ToJSONOption
            ) => unknown
        }
    }
}

export default function toJSON(schema: CustomSchema) {
    schema.options.toJSON = {
        virtuals: true,
        transform: function (doc: Document, ret: IRet, options: ToJSONOption) {
            const { exclude, virtuals } = options || {}

            Object.keys(schema.paths).forEach((path) => {
                const fieldOptions = schema.paths[path].options as PrivateOption

                if (fieldOptions && fieldOptions.private) {
                    delete ret[path]
                }
            })

            if (exclude) {
                exclude.forEach((field) => {
                    delete ret[field]
                })
            }

            if (virtuals) {
                Object.keys(schema.virtuals).forEach((virtualPath) => {
                    const virtual = schema.virtuals[virtualPath]

                    if (virtual.getters && !virtual.options?.hidden) {
                        ret[virtualPath] = virtual.getters[0].call(doc)
                    }
                })
            }

            ret.id = ret._id.toString()
            delete ret._id
            delete ret.__v
            delete ret.createdAt
            delete ret.updatedAt

            return ret
        },
    }
}
