import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity()
export class ServiceRequest {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => User)
    user!: User;

    @Column()
    location!: string;

    @Column()
    vehicleType!: string;

    @Column()
    serviceType!: string;

    @Column({
        type: "enum",
        enum: ["pending", "accepted", "in_progress", "completed", "cancelled"],
        default: "pending"
    })
    status!: string;

    @Column({ nullable: true })
    description?: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
} 