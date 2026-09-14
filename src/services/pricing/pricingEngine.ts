import { PricingCalculationInput, PricingCalculationResult } from '../../models/pricing';

/**
 * KalaSetu Deterministic Pricing Engine
 *
 * Implements transparent, explainable pricing formulas for traditional artisans.
 * Financial arithmetic is strictly deterministic and never delegated to an LLM.
 */
export class PricingEngine {
  /**
   * Calculates total production cost, recommended retail selling price,
   * bulk pricing, and fair livelihood benchmarks based on artisan inputs.
   */
  public static calculate(input: PricingCalculationInput): PricingCalculationResult {
    const materialCost = Math.max(0, Math.round(input.materialCost || 0));
    const labourCostPerDay = Math.max(0, Math.round(input.labourCostPerDay || 0));
    const labourDays = Math.max(0.1, Number((input.labourDays || 1).toFixed(1)));
    const packagingCost = Math.max(0, Math.round(input.packagingCost || 0));
    const additionalCost = Math.max(0, Math.round(input.additionalCost || 0));
    const marginPercent = Math.max(0, Math.min(100, Math.round(input.marginPercent ?? 20)));

    // Total labor cost
    const totalLabourCost = Math.round(labourCostPerDay * labourDays);

    // Total direct cost to create the product
    const totalCalculatedCost = materialCost + totalLabourCost + packagingCost + additionalCost;

    // Suggested retail price factoring fair margin
    const rawSuggestedRetail = totalCalculatedCost * (1 + marginPercent / 100);
    // Round retail price to nearest 10 for clean commerce presentation
    const suggestedRetailPrice = Math.max(
      totalCalculatedCost,
      Math.round(rawSuggestedRetail / 10) * 10
    );

    // Suggested wholesale / bulk price (lower margin buffer for volume orders)
    const bulkMarginPercent = Math.max(5, Math.round(marginPercent * 0.6));
    const rawSuggestedBulk = totalCalculatedCost * (1 + bulkMarginPercent / 100);
    const suggestedBulkPrice = Math.max(
      totalCalculatedCost,
      Math.round(rawSuggestedBulk / 10) * 10
    );

    // Final price defaults to suggested retail price unless explicitly overridden
    const finalListingPrice = input.finalPriceOverride !== undefined && input.finalPriceOverride > 0
      ? Math.round(input.finalPriceOverride)
      : suggestedRetailPrice;

    return {
      materialCost,
      labourCostPerDay,
      labourDays,
      totalLabourCost,
      packagingCost,
      additionalCost,
      marginPercent,
      totalCalculatedCost,
      suggestedRetailPrice,
      suggestedBulkPrice,
      finalListingPrice,
      currency: 'INR',
    };
  }

  /**
   * Generates a transparent human-readable breakdown of the calculation.
   */
  public static explain(result: PricingCalculationResult): string {
    return (
      `₹${result.materialCost} (Materials) + ` +
      `₹${result.totalLabourCost} (${result.labourDays} days @ ₹${result.labourCostPerDay}/day) + ` +
      `₹${result.packagingCost} (Packaging) + ` +
      `${result.marginPercent}% Margin = ₹${result.suggestedRetailPrice}`
    );
  }
}
