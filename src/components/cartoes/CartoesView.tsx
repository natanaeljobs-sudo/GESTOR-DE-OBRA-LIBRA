import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBRL } from '../../utils/currency';
import { formatDateBR } from '../../utils/date';
import { Modal } from '../common/Modal';
import {
  CreditCard,
  Plus,
  AlertCircle,
} from 'lucide-react';

export const CartoesView: React.FC = () => {
  const { cartoes, parcelas, addCartao, pagarParcela, despesas, navigateToTabWithFilter } = useApp();
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  const [apelido, setApelido] = useState('');
  const [tipo, setTipo] = useState<'credito' | 'debito' | 'conta_corrente'>('credito');
  const [bandeira, setBandeira] = useState('Mastercard');
  const [ultimosDigitos, setUltimosDigitos] = useState('');
  const [diaFechamento, setDiaFechamento] = useState<number>(25);
  const [diaVencimento, setDiaVencimento] = useState<number>(5);
  const [limite, setLimite] = useState<number>(15000);
  const [titular, setTitular] = useState('Natanael');

  const despesasPendentesCartao = despesas.filter(
    d => d.formaPagamento === 'nao_informado' || (!d.cartaoId && d.formaPagamento === 'cartao_credito')
  );

  const totalParcelasAVencer = parcelas
    .filter(p => p.status === 'a_vencer')
    .reduce((sum, p) => sum + p.valorParcela, 0);

  const totalParcelasPagas = parcelas
    .filter(p => p.status === 'paga')
    .reduce((sum, p) => sum + p.valorParcela, 0);

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apelido.trim()) return;

    addCartao({
      apelido: apelido.trim(),
      tipo,
      bandeira,
      ultimosDigitos: ultimosDigitos.trim() || undefined,
      diaFechamento,
      diaVencimento,
      limite,
      titular: titular.trim(),
    });

    setIsCardModalOpen(false);
    setApelido('');
    setUltimosDigitos('');
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111c2d] dark:text-white">
            Cartões, Contas & Faturas Futuras
          </h1>
          <p className="text-xs sm:text-sm text-[#707a82] dark:text-[#7c8fac] mt-0.5">
            Previsão de parcelamento, vencimento de faturas e regularização de lançamentos com dados pendentes.
          </p>
        </div>

        <button
          onClick={() => setIsCardModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] active:scale-95 rounded-xl shadow-sm shadow-[#0085db]/25 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Cartão / Conta</span>
        </button>
      </div>

      {/* Pending Card Info Warning if any */}
      {despesasPendentesCartao.length > 0 && (
        <div className="bg-[#f8c076]/15 border border-[#f8c076]/30 rounded-[18px] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#f8c076]/20 text-[#d9941a] dark:text-[#f8c076] flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-[#111c2d] dark:text-white text-sm">
                {despesasPendentesCartao.length} compra(s) sem cartão ou parcelas informadas
              </p>
              <p className="text-[#707a82] dark:text-[#7c8fac] mt-0.5">
                Os valores já estão somados nos custos da obra, mas a fatura futura só pode ser calculada quando o cartão for associado.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigateToTabWithFilter('despesas', 'nao_informado')}
            className="px-4 py-2 rounded-xl bg-[#0085db] hover:bg-[#0071ba] text-white font-bold whitespace-nowrap self-start sm:self-auto cursor-pointer shadow-sm shadow-[#0085db]/20"
          >
            Ver Compras Pendentes
          </button>
        </div>
      )}

      {/* Cards KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cartoes.map(card => {
          const cardParcelas = parcelas.filter(p => p.cartaoId === card.id);
          const aVencer = cardParcelas.filter(p => p.status === 'a_vencer').reduce((sum, p) => sum + p.valorParcela, 0);

          return (
            <div
              key={card.id}
              className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-5 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#707a82] uppercase tracking-wider">
                    {card.bandeira || 'Cartão'} · Final {card.ultimosDigitos || '****'}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-[#0085db]/10 text-[#0085db] flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                </div>
                <h2 className="text-base font-extrabold text-[#111c2d] dark:text-white mt-1">
                  {card.apelido}
                </h2>
                <p className="text-xs text-[#707a82] mt-0.5">
                  Titular: {card.titular}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] space-y-1 text-xs">
                <div className="flex justify-between text-[#707a82]">
                  <span>Fechamento / Vencimento:</span>
                  <span className="font-semibold text-[#111c2d] dark:text-white">
                    Dia {card.diaFechamento} / Dia {card.diaVencimento}
                  </span>
                </div>
                <div className="flex justify-between text-[#707a82]">
                  <span>Faturas futuras a vencer:</span>
                  <span className="font-bold text-[#0085db] tabular-nums">
                    {formatBRL(aVencer)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Installments Ledger */}
      <div className="bg-white dark:bg-[#111c2d] border border-[#e6ecf1] dark:border-[#333f55] rounded-[18px] p-6 shadow-[0px_2px_6px_rgba(37,83,185,0.06)] dark:shadow-none space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#e6ecf1] dark:border-[#333f55]">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#111c2d] dark:text-white">
              Cronograma de Parcelas & Vencimentos
            </h2>
            <p className="text-xs text-[#707a82] mt-0.5">
              Total a vencer: <strong className="text-[#fb977d] tabular-nums">{formatBRL(totalParcelasAVencer)}</strong> · Total quitado: <strong className="text-[#4bd08b] tabular-nums">{formatBRL(totalParcelasPagas)}</strong>
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#e6ecf1] dark:border-[#333f55] text-[#707a82] dark:text-[#7c8fac] font-bold text-[11px] uppercase tracking-wider">
                <th className="pb-3">Vencimento</th>
                <th className="pb-3">Descrição da Compra</th>
                <th className="pb-3">Parcela</th>
                <th className="pb-3">Cartão</th>
                <th className="pb-3 text-right">Valor da Parcela</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6ecf1] dark:divide-[#333f55]">
              {parcelas.map(p => {
                const card = cartoes.find(c => c.id === p.cartaoId);
                return (
                  <tr key={p.id} className="hover:bg-[#f6f9fc] dark:hover:bg-[#1a2535]">
                    <td className="py-3 font-semibold text-[#111c2d] dark:text-white whitespace-nowrap">
                      {formatDateBR(p.dataVencimento)}
                    </td>
                    <td className="py-3 font-medium text-[#111c2d] dark:text-white">
                      {p.descricao}
                    </td>
                    <td className="py-3 text-[#707a82] tabular-nums">
                      {p.numeroParcela} de {p.totalParcelas}
                    </td>
                    <td className="py-3 text-[#707a82]">
                      {card?.apelido || 'Cartão Geral'}
                    </td>
                    <td className="py-3 text-right font-black text-[#111c2d] dark:text-white tabular-nums">
                      {formatBRL(p.valorParcela)}
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 'paga'
                            ? 'bg-[#4bd08b]/15 text-[#4bd08b]'
                            : 'bg-[#f8c076]/20 text-[#d9941a] dark:text-[#f8c076]'
                        }`}
                      >
                        {p.status === 'paga' ? 'Paga' : 'A Vencer'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {p.status !== 'paga' && (
                        <button
                          onClick={() => pagarParcela(p.id)}
                          className="px-3 py-1 text-xs font-bold text-[#4bd08b] hover:bg-[#4bd08b]/15 rounded-xl transition-colors cursor-pointer"
                        >
                          Marcar Paga
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Card */}
      <Modal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        title="Cadastrar Cartão ou Conta Bancária"
        subtitle="Armazene apelido e datas de fechamento/vencimento para cálculo de faturas."
        maxWidth="md"
      >
        <form onSubmit={handleSaveCard} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
              Apelido do Cartão / Conta *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Nubank Natanael, Inter Obra PJ..."
              value={apelido}
              onChange={e => setApelido(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0085db]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Bandeira
              </label>
              <select
                value={bandeira}
                onChange={e => setBandeira(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
              >
                <option value="Mastercard">Mastercard</option>
                <option value="Visa">Visa</option>
                <option value="Elo">Elo</option>
                <option value="Pix">Conta Pix Direta</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                4 Últimos Dígitos
              </label>
              <input
                type="text"
                maxLength={4}
                placeholder="4821"
                value={ultimosDigitos}
                onChange={e => setUltimosDigitos(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Dia de Fechamento
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={diaFechamento}
                onChange={e => setDiaFechamento(parseInt(e.target.value) || 25)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
                Dia de Vencimento
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={diaVencimento}
                onChange={e => setDiaVencimento(parseInt(e.target.value) || 5)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111c2d] dark:text-white mb-1">
              Titular Responsável
            </label>
            <input
              type="text"
              value={titular}
              onChange={e => setTitular(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6ecf1] dark:border-[#333f55] bg-[#f6f9fc] dark:bg-[#1a2535] text-[#111c2d] dark:text-white"
            />
          </div>

          <div className="pt-3 border-t border-[#e6ecf1] dark:border-[#333f55] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCardModalOpen(false)}
              className="px-3.5 py-2 text-xs text-[#707a82] hover:text-[#111c2d] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-[#0085db] hover:bg-[#0071ba] rounded-xl shadow-xs cursor-pointer"
            >
              Salvar Cartão
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
