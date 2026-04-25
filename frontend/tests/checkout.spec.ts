import { test, expect } from '@playwright/test';

test.describe('Fluxo Crítico de Compra', () => {
  test('deve realizar login e finalizar um pedido com sucesso', async ({ page }) => {
    // 1. Login
    await page.goto('/');
    await page.getByPlaceholder('(88) 99999-9999').fill('5588000000000');
    await page.getByRole('button', { name: 'Receber Código via WhatsApp' }).click();
    
    await page.getByPlaceholder('000000').fill('999999');
    await page.getByRole('button', { name: 'Entrar no Marketplace' }).click();

    // 2. Aguardar carregar e selecionar Produto
    await expect(page.getByText('Olá, Robô de Teste')).toBeVisible({ timeout: 15000 });
    
    // Esperar o skeleton de carregamento sumir
    await expect(page.locator('.animate-pulse')).toHaveCount(0);
    
    // Clicar no produto "Cimento CP II"
    const productCard = page.getByText('Cimento CP II').first();
    await expect(productCard).toBeVisible();
    await productCard.click();

    // 3. Adicionar ao Carrinho (Aguardar página de detalhes)
    const addBtn = page.getByRole('button', { name: 'Adicionar ao Carrinho' });
    await expect(addBtn).toBeVisible({ timeout: 10000 });
    await addBtn.click();
    
    // Aguardar feedback de "Adicionado!"
    await expect(page.getByText('Adicionado!')).toBeVisible();

    // Voltar para a Home para ver o Bottom Nav
    await page.locator('header button').first().click();

    // 4. Ir para o Carrinho
    await page.getByText('Carrinho').click();
    await expect(page.getByText('Meu Carrinho')).toBeVisible();

    // 5. Finalizar Pedido
    await page.getByRole('button', { name: 'Finalizar Pedido' }).click();
    await expect(page.getByText('Finalizar Pedido')).toBeVisible();
    
    await page.getByText('PIX').click();
    await page.getByRole('button', { name: 'Confirmar Pedido' }).click();

    // 6. Sucesso
    await expect(page.getByText('Pedido Realizado')).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('#')).toBeVisible();
  });
});
