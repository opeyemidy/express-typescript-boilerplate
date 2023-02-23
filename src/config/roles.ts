const allRoles = {
    user: [],
    admin: ["getUsers", "manageUsers"],
}

const roles = Object.keys(allRoles)
const roleRights = new Map(Object.entries(allRoles))
type Roles = keyof typeof allRoles

export { roles, roleRights, Roles }
