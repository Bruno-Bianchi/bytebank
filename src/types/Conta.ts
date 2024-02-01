import { Transacao } from "./Transacao.js"
import { TipoTransacao } from "./TipoTransacao.js"
import { GrupoTransacao } from "./GrupoTransacao.js"

let saldo: number = JSON.parse(localStorage.getItem("saldo")) || 0
const transacoes: Transacao[] = JSON.parse(localStorage.getItem("transacoes"), (key: string, value: string) => {
    if(key === "data") {
        return new Date(value)
    }

    return value
}) || [] 
// se há dados do store traz esses dados para 'transacoes' e da o parse se não inicia o array vazio

function debitar(valor: number): void {
    if(valor <= 0) {
        throw new Error("O valor a ser debitado deve ser maior que zero!")
    }
    if(valor > saldo) {
        throw new Error("Saldo insuficiente!")
    }
    saldo -= valor
    localStorage.setItem("saldo", saldo.toString())
}

function depositar(valor: number): void {
    if(valor <= 0) {
        throw new Error("O valor a ser depositado deve ser maior que zero")
    }
    saldo += valor
    localStorage.setItem("saldo", saldo.toString())
}

const Conta = {
    getSaldo() {
        return saldo
    },

    getDataAcesso(): Date {
        return new Date()
    },

    getGruposTransacoes(): GrupoTransacao[] {
        const gruposTransacoes: GrupoTransacao[] = []
        const listaTransacoes: Transacao[] = structuredClone(transacoes)
        const transacoesOrdenadas: Transacao[] = listaTransacoes.sort((t1,t2) => t2.data.getTime() - t1.data.getTime()) //ordenação decrescente por data
        let labelAtualGrupoTransacao: string = "";

        for(let transacao of transacoesOrdenadas) {
            let labelGrupoTransacao: string = transacao.data.toLocaleDateString("pt-br", { month: "long", year: "numeric" })

            if(labelAtualGrupoTransacao !== labelGrupoTransacao) {
                labelAtualGrupoTransacao = labelGrupoTransacao
                gruposTransacoes.push({
                    label: labelGrupoTransacao,
                    transacoes: []
                })
            }
            gruposTransacoes.at(-1).transacoes.push(transacao)
        }

        return gruposTransacoes
    },

    registrarTransacao(novaTransacao: Transacao): void {
        if (novaTransacao.tipoTransacao == TipoTransacao.DEPOSITO) {
            depositar(novaTransacao.valor)
        } 
        else if (novaTransacao.tipoTransacao == TipoTransacao.TRANSFERENCIA || novaTransacao.tipoTransacao == TipoTransacao.PAGAMENTO_BOLETO) {
            debitar(novaTransacao.valor)
            novaTransacao.valor *= -1;
        } 
        else {
            throw new Error("Tipo de transação é inválido!")
        }

        transacoes.push(novaTransacao)
        localStorage.setItem("transacoes", JSON.stringify(transacoes))
    }
}

export default Conta