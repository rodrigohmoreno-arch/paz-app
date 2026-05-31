import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, totalPrice, totalPoints, discount, discountAmount, userId, guestEmail, guestName, guestPhone } = body;

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json({
        orderId: `PAZ-${Date.now()}`,
        message: "Pedido registrado (MercadoPago no configurado - modo demo)",
        totalPrice,
        totalPoints,
        discount,
        discountAmount,
        userId,
        guestEmail,
        guestName,
        guestPhone,
        items,
      });
    }

    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    const preferenceData = await preference.create({
      body: {
        items: items.map((item: { id: string; name: string; price: number; quantity: number }) => ({
          id: item.id,
          title: item.name,
          unit_price: item.price,
          quantity: item.quantity,
          currency_id: "ARS",
        })),
        payer: {
          email: guestEmail || "comprador@email.com",
          name: guestName || "Comprador",
          phone: guestPhone ? { number: guestPhone } : undefined,
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL || "https://paz-app-paz6.vercel.app"}/checkout/success`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL || "https://paz-app-paz6.vercel.app"}/checkout/failure`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL || "https://paz-app-paz6.vercel.app"}/checkout/pending`,
        },
        auto_return: "approved",
        external_reference: JSON.stringify({ userId, totalPoints, discount }),
        metadata: {
          userId,
          totalPoints,
          discount,
        },
      },
    });

    return NextResponse.json({
      init_point: preferenceData.init_point,
      preference_id: preferenceData.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al crear preferencia de pago";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
