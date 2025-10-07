export type User = { 
    id: number; 
    first_name: string; 
    last_name: string; 
    middle_name: string;
    email: string; 
    role: { id: number; name: string } 
};
