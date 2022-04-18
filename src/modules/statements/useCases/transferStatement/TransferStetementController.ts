import { Request, Response } from "express";
import { container } from "tsyringe";
import { TransferStatementUseCase } from "./TransferStatementUseCase";

enum OperationType {
  TRANSFER = 'transfer'
}
class TransferStatementController {
  async execute(request: Request, response: Response): Promise<Response> {
    const { id: sender_id } = request.user;
    const { amount, description } = request.body;
    const { user_id: receiver_id } = request.params
    const transferStatementUseCase = container.resolve(TransferStatementUseCase)

    const type = 'transfer' as OperationType

    await transferStatementUseCase.execute({
      amount, description, type, receiver_id, sender_id
    })

    return response.status(201).send()
  }
}

export { TransferStatementController }