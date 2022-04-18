import { OperationType } from "../../entities/Statement";

interface ITransferStatementDTO {
  amount: number
  description: string
  sender_id: string
  receiver_id: string
  type: OperationType
}

export { ITransferStatementDTO }