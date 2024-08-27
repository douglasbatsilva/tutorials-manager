import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true, versionKey: false })
export class Users {
  @Prop() _id: string;
  @Prop() userName: string;
  @Prop() email: string;
  @Prop() password: string;
  @Prop() createdAt: Date;
  @Prop() updatedAt: Date;
}

export const UsersSchema = SchemaFactory.createForClass(Users);
