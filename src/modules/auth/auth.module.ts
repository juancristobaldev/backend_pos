import { Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';

// Ensure to install the necessary packages
// Run the following command in your terminal:
// npm install @nestjs/graphql graphql-tools graphql apollo-server-express

@Module({
  providers: [AuthResolver, AuthService],
  exports: [AuthService],
})
export class AuthModule {}
