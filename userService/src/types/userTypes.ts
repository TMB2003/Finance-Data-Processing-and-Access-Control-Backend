export interface userSchema {
    _id: object;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
}

export interface UserRequest {
    id: string;
    role: string;
}
