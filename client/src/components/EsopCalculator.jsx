import React, { useState } from 'react';
import { Calculator, AlertTriangle, ShieldCheck, Info, Layers, DollarSign, Calendar, TrendingUp } from 'lucide-react';

export default function EsopCalculator() {
  // Inputs
  const [totalShares, setTotalShares] = useState(1000000);
  const [esopPoolShares, setEsopPoolShares] = useState(100000);
  const [optionsGranted, setOptionsGranted] = useState(10000);
  const [vestingYears, setVestingYears] = useState(4);
  const [cliffMonths, setCliffMonths] = useState(12);
  const [currency, setCurrency] = useState('INR'); // 'INR' | 'USD'
  const [companyValuation, setCompanyValuation] = useState(50000000); // 5 Cr INR default

  // Math Calculations
  const numTotalShares = Math.max(1, parseFloat(totalShares) || 1);
  const numOptionsGranted = Math.max(0, parseFloat(optionsGranted) || 0);
  const numValuation = Math.max(0, parseFloat(companyValuation) || 0);
  const numVestingYears = Math.max(1, parseFloat(vestingYears) || 1);
  const numCliffMonths = parseFloat(cliffMonths) || 0;

  // Diluted Ownership %
  const employeeOwnershipPct = (numOptionsGranted / numTotalShares) * 100;
  const esopPoolPct = ((parseFloat(esopPoolShares) || 0) / numTotalShares) * 100;
  const sharePrice = numValuation > 0 ? numValuation / numTotalShares : 0;
  const totalGrantedValue = numOptionsGranted * sharePrice;

  // Validation warning for Cliff < 12 Months
  const isCliffInvalid = numCliffMonths < 12;

  const formatCurrency = (val) => {
    if (!val || val === 0) return 'N/A';
    if (currency === 'INR') {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  // Generate 4-Year Vesting Schedule with 1-Year Cliff (25% cliff + 75% monthly over 36 months)
  const generateVestingSchedule = () => {
    const totalVestingMonths = numVestingYears * 12;
    const schedule = [];

    // Cliff Event (Month 12 or selected cliff)
    const cliffPct = 25; // 25% at 1-year cliff
    const cliffShares = (numOptionsGranted * cliffPct) / 100;
    schedule.push({
      month: numCliffMonths,
      label: `Year 1 (Month ${numCliffMonths} Cliff)`,
      pctThisPeriod: cliffPct,
      cumPct: cliffPct,
      cumShares: cliffShares,
      vestedValue: cliffShares * sharePrice,
      unvestedValue: (numOptionsGranted - cliffShares) * sharePrice
    });

    // Post-cliff remaining 75% over remaining months
    const remainingMonths = Math.max(1, totalVestingMonths - numCliffMonths);
    const postCliffPctTotal = 100 - cliffPct;
    const monthlyPct = postCliffPctTotal / remainingMonths;

    // Annual summary milestones
    for (let yr = 2; yr <= numVestingYears; yr++) {
      const targetMonth = yr * 12;
      const monthsAccrued = Math.min(remainingMonths, targetMonth - numCliffMonths);
      const cumPct = Math.min(100, cliffPct + (monthsAccrued * monthlyPct));
      const cumShares = (numOptionsGranted * cumPct) / 100;

      schedule.push({
        month: targetMonth,
        label: `End of Year ${yr} (Month ${targetMonth})`,
        pctThisPeriod: (100 - cliffPct) / (numVestingYears - 1),
        cumPct: cumPct,
        cumShares: cumShares,
        vestedValue: cumShares * sharePrice,
        unvestedValue: (numOptionsGranted - cumShares) * sharePrice
      });
    }

    return schedule;
  };

  const scheduleData = generateVestingSchedule();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white border border-line rounded-2xl p-8 card-shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-line">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="eyebrow block">§ Compliance Tool</span>
              <span className="px-3 py-0.5 bg-mint text-forest font-semibold text-xs rounded-full">
                Rule 12, Companies Share Capital Rules 2014 &amp; SEBI SBEB 2021
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display text-forest-deep">ESOP Vesting &amp; Valuation Calculator</h1>
            <p className="text-ink-soft mt-1">
              Calculate equity ownership, statutory 1-year cliff vesting schedules, and potential option valuation.
            </p>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
          <div>
            <label className="block text-xs font-semibold text-forest-deep uppercase tracking-wider mb-2">
              Total Company Shares Outstanding
            </label>
            <input
              type="number"
              min="1"
              value={totalShares}
              onChange={(e) => setTotalShares(e.target.value)}
              className="cursor-target w-full border border-line rounded-xl px-4 py-2.5 bg-paper text-sm text-ink font-bold focus:outline-none focus:border-forest"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-forest-deep uppercase tracking-wider mb-2">
              Total ESOP Pool Size (Shares)
            </label>
            <input
              type="number"
              min="0"
              value={esopPoolShares}
              onChange={(e) => setEsopPoolShares(e.target.value)}
              className="cursor-target w-full border border-line rounded-xl px-4 py-2.5 bg-paper text-sm text-ink font-bold focus:outline-none focus:border-forest"
            />
            <span className="text-xs text-ink-soft mt-1 block">
              Pool represents {esopPoolPct.toFixed(2)}% of total company equity
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-forest-deep uppercase tracking-wider mb-2">
              Options Granted to Employee
            </label>
            <input
              type="number"
              min="0"
              value={optionsGranted}
              onChange={(e) => setOptionsGranted(e.target.value)}
              className="cursor-target w-full border border-line rounded-xl px-4 py-2.5 bg-paper text-sm text-ink font-bold focus:outline-none focus:border-forest"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-forest-deep uppercase tracking-wider mb-2">
              Vesting Period (Years)
            </label>
            <select
              value={vestingYears}
              onChange={(e) => setVestingYears(parseFloat(e.target.value))}
              className="cursor-target w-full border border-line rounded-xl px-4 py-2.5 bg-paper text-sm text-ink font-semibold focus:outline-none focus:border-forest"
            >
              <option value="1">1 Year</option>
              <option value="2">2 Years</option>
              <option value="3">3 Years</option>
              <option value="4">4 Years (Standard Market Practice)</option>
              <option value="5">5 Years</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-forest-deep uppercase tracking-wider mb-2">
              Cliff Period (Months — Min 12 Months)
            </label>
            <input
              type="number"
              min="0"
              max="24"
              value={cliffMonths}
              onChange={(e) => setCliffMonths(e.target.value)}
              className={`cursor-target w-full border rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none ${
                isCliffInvalid ? 'border-red-500 bg-red-50 text-red-900' : 'border-line bg-paper text-ink focus:border-forest'
              }`}
            />
            {isCliffInvalid && (
              <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Minimum 12 months cliff mandated under Indian Law!
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-forest-deep uppercase tracking-wider mb-2">
              Company Valuation (Optional)
            </label>
            <div className="flex gap-2">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="cursor-target border border-line rounded-xl px-2 py-2.5 bg-paper text-xs text-ink font-bold"
              >
                <option value="INR">₹ (INR)</option>
                <option value="USD">$ (USD)</option>
              </select>
              <input
                type="number"
                min="0"
                value={companyValuation}
                onChange={(e) => setCompanyValuation(e.target.value)}
                className="cursor-target w-full border border-line rounded-xl px-4 py-2.5 bg-paper text-sm text-ink font-bold focus:outline-none focus:border-forest"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-line rounded-2xl p-6 card-shadow">
          <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider block mb-1">
            Employee Equity Share
          </span>
          <div className="text-3xl font-display text-forest-deep font-bold">
            {employeeOwnershipPct.toFixed(4)}%
          </div>
          <span className="text-xs text-ink-soft mt-1 block">
            {numOptionsGranted.toLocaleString()} options of {numTotalShares.toLocaleString()} total shares
          </span>
        </div>

        <div className="bg-white border border-line rounded-2xl p-6 card-shadow">
          <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider block mb-1">
            Statutory Cliff Requirement
          </span>
          <div className="text-xl font-display text-forest-deep font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-leaf" /> {cliffMonths} Months Cliff
          </div>
          <span className="text-xs text-leaf font-medium mt-1 block">
            Rule 12(6) Compliant Minimum
          </span>
        </div>

        <div className="bg-white border border-line rounded-2xl p-6 card-shadow">
          <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider block mb-1">
            Implied Share Price
          </span>
          <div className="text-2xl font-display text-forest-deep font-bold">
            {formatCurrency(sharePrice)}
          </div>
          <span className="text-xs text-ink-soft mt-1 block">
            Valuation ÷ Total Outstanding Shares
          </span>
        </div>

        <div className="bg-white border border-line rounded-2xl p-6 card-shadow">
          <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider block mb-1">
            Total Granted Equity Value
          </span>
          <div className="text-2xl font-display text-forest-deep font-bold">
            {formatCurrency(totalGrantedValue)}
          </div>
          <span className="text-xs text-leaf font-medium mt-1 block">
            Estimated gross value at grant
          </span>
        </div>
      </div>

      {/* Vesting Schedule Table */}
      <div className="bg-white border border-line rounded-2xl p-6 card-shadow space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-line">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-leaf" />
            <h3 className="text-xl font-semibold text-forest-deep">Standard Vesting Schedule Breakdown</h3>
          </div>
          <span className="px-3 py-1 bg-mint text-forest font-semibold text-xs rounded-full">
            25% Cliff + 75% Monthly/Quarterly
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-paper border-b border-line text-xs font-semibold text-forest-deep uppercase tracking-wider">
                <th className="p-3.5">Milestone</th>
                <th className="p-3.5">% Vested</th>
                <th className="p-3.5">Cumulative %</th>
                <th className="p-3.5">Options Vested</th>
                <th className="p-3.5">Estimated Vested Value</th>
                <th className="p-3.5">Remaining Unvested Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {scheduleData.map((row, idx) => (
                <tr key={idx} className="hover:bg-paper/50 transition-colors">
                  <td className="p-3.5 font-semibold text-forest-deep">{row.label}</td>
                  <td className="p-3.5 font-medium text-leaf">+{row.pctThisPeriod.toFixed(1)}%</td>
                  <td className="p-3.5 font-bold text-forest-deep">{row.cumPct.toFixed(1)}%</td>
                  <td className="p-3.5 font-semibold text-ink">{Math.round(row.cumShares).toLocaleString()}</td>
                  <td className="p-3.5 font-semibold text-forest">{formatCurrency(row.vestedValue)}</td>
                  <td className="p-3.5 text-ink-soft">{formatCurrency(row.unvestedValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mandatory Statutory Disclaimer */}
      <div className="p-6 bg-paper border border-line rounded-2xl text-xs text-ink-soft leading-relaxed space-y-2 card-shadow">
        <div className="flex items-center gap-2 font-semibold text-forest-deep">
          <Info className="w-4 h-4 text-leaf" /> Statutory Legal Disclaimer
        </div>
        <p className="font-serif italic text-forest-deep/90">
          "For illustrative purposes only — actual ESOP terms are governed by your scheme document, Rule 12 of the Companies (Share Capital and Debentures) Rules, 2014, and (for listed companies) SEBI's SBEB &amp; SE Regulations, 2021. This tool does not replace legal or tax advice."
        </p>
      </div>
    </div>
  );
}
