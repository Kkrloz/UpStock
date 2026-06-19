/**
 * UpStock Test Dashboard Application
 */

// App State
const state = {
    token: localStorage.getItem('upstock_token') || null,
    user: JSON.parse(localStorage.getItem('upstock_user')) || null,
    editingProductId: null
};

// DOM Elements
const toastContainer = document.getElementById('toast-container');
const userBadge = document.getElementById('user-badge');
const userBadgeText = document.getElementById('user-badge-text');

// Auth Form elements
const authCard = document.getElementById('auth-card');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authTabs = document.querySelectorAll('.auth-tab');
const authLoggedState = document.getElementById('auth-logged-state');
const loggedUserName = document.getElementById('logged-user-name');
const loggedUserEmail = document.getElementById('logged-user-email');
const jwtTokenPreview = document.getElementById('jwt-token-preview');
const btnCopyToken = document.getElementById('btn-copy-token');
const btnLogout = document.getElementById('btn-logout');
const userAvatarInitials = document.getElementById('user-avatar-initials');

// Product Form elements
const productFormCard = document.getElementById('product-form-card');
const productForm = document.getElementById('product-form');
const productIdInput = document.getElementById('product-id');
const productNameInput = document.getElementById('product-name');
const productPriceInput = document.getElementById('product-price');
const productQuantityInput = document.getElementById('product-quantity');
const productDescriptionInput = document.getElementById('product-description');
const btnCancelEdit = document.getElementById('btn-cancel-edit');
const btnSubmitProduct = document.getElementById('btn-submit-product');
const productFormTitle = document.getElementById('product-form-title');
const productFormSubtitle = document.getElementById('product-form-subtitle');
const productFormBadge = document.getElementById('product-form-badge');

// List & Console elements
const productsTbody = document.getElementById('products-tbody');
const btnRefreshProducts = document.getElementById('btn-refresh-products');
const consoleTerminal = document.getElementById('console-terminal');
const btnClearConsole = document.getElementById('btn-clear-console');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initAuthTabs();
    updateAuthUI();
    
    // Auth Forms Listeners
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    btnLogout.addEventListener('click', logout);
    btnCopyToken.addEventListener('click', copyTokenToClipboard);

    // Product Form Listeners
    productForm.addEventListener('submit', handleProductSubmit);
    btnCancelEdit.addEventListener('click', cancelEditing);

    // List & Console Listeners
    btnRefreshProducts.addEventListener('click', () => {
        if (!state.token) {
            showToast('Por favor, efetue login para buscar os produtos.', 'error');
            return;
        }
        fetchProducts();
    });
    btnClearConsole.addEventListener('click', clearConsole);

    // If authenticated on load, fetch products
    if (state.token) {
        fetchProducts();
    }
});

/* ==========================================================================
   Toast Notification Helper
   ========================================================================== */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Add icon based on type
    let iconSvg = '';
    if (type === 'success') {
        iconSvg = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3"/></svg>`;
    } else if (type === 'error') {
        iconSvg = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    } else {
        iconSvg = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toast.innerHTML = `
        ${iconSvg}
        <div class="toast-message">${message}</div>
        <button class="toast-close">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
    `;
    
    toastContainer.appendChild(toast);

    // Bind close action
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px) scale(0.9)';
        setTimeout(() => toast.remove(), 300);
    });

    // Auto remove
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px) scale(0.9)';
            setTimeout(() => toast.remove(), 300);
        }
    }, 4000);
}

/* ==========================================================================
   HTTP Console Logger
   ========================================================================== */
function logRequest(method, url, requestBody, status, responseBody) {
    const entryId = 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${method.toLowerCase()}`;
    
    const time = new Date().toLocaleTimeString();
    const isSuccess = status >= 200 && status < 300;
    const statusClass = isSuccess ? 's-success' : 's-error';
    
    // Shorten absolute URLs to display path
    let displayUrl = url;
    try {
        const parsedUrl = new URL(url, window.location.origin);
        displayUrl = parsedUrl.pathname + parsedUrl.search;
    } catch(e) {}

    // Formata JSON se possível
    let prettyRequest = '';
    if (requestBody) {
        try {
            prettyRequest = JSON.stringify(JSON.parse(requestBody), null, 2);
        } catch(e) {
            prettyRequest = typeof requestBody === 'object' ? JSON.stringify(requestBody, null, 2) : requestBody;
        }
    }

    let prettyResponse = '';
    if (responseBody) {
        try {
            prettyResponse = JSON.stringify(responseBody, null, 2);
        } catch(e) {
            prettyResponse = typeof responseBody === 'object' ? JSON.stringify(responseBody, null, 2) : responseBody;
        }
    }

    logEntry.innerHTML = `
        <div class="log-meta">
            <span class="log-method-url">
                <span class="log-method ${method.toLowerCase()}">${method}</span> 
                <span class="text-secondary">${displayUrl}</span>
            </span>
            <span>
                <span class="log-status ${statusClass}">${status}</span> 
                <span class="text-muted" style="margin-left: 6px;">${time}</span>
            </span>
        </div>
        <button class="log-payload-toggle" onclick="toggleLogDetails('${entryId}')">Inspecionar Detalhes</button>
        <div id="${entryId}" class="log-details hidden">
${prettyRequest ? `<strong>Payload da Requisição:</strong>\n${prettyRequest}\n\n` : ''}<strong>Resposta da API:</strong>\n${prettyResponse || '(Sem corpo de resposta)'}
        </div>
    `;

    consoleTerminal.appendChild(logEntry);
    
    // Auto scroll to bottom
    consoleTerminal.scrollTop = consoleTerminal.scrollHeight;
}

// Attach to global window scope so onclick in template works
window.toggleLogDetails = function(id) {
    const details = document.getElementById(id);
    if (details) {
        details.classList.toggle('hidden');
    }
};

function clearConsole() {
    consoleTerminal.innerHTML = `
        <div class="console-log-welcome">
            <span class="c-accent">></span> Console limpo. Aguardando novas requisições...
        </div>
    `;
    showToast('Histórico do console limpo.', 'info');
}

/* ==========================================================================
   Custom API Client Wrapper (Fetch + Logging)
   ========================================================================== */
async function apiCall(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${window.location.origin}${endpoint}`;
    
    // Set headers
    options.headers = options.headers || {};
    if (!(options.body instanceof FormData)) {
        options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
    }
    
    // Inject Authorization JWT
    if (state.token) {
        options.headers['Authorization'] = `Bearer ${state.token}`;
    }

    const method = options.method || 'GET';
    const requestBody = options.body;

    try {
        const response = await fetch(url, options);
        let responseData = null;
        
        // Try parsing json, fallback to text
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
        } else {
            responseData = await response.text();
        }

        // Log transaction to our HTML console
        logRequest(method, url, requestBody, response.status, responseData);

        if (!response.ok) {
            // Throw enriched error object
            throw { status: response.status, data: responseData };
        }

        return responseData;
    } catch (error) {
        if (error.status) {
            // Already logged by logRequest
            throw error;
        } else {
            // Connection/Network error
            logRequest(method, url, requestBody, 0, error.message || error);
            throw { status: 0, message: 'Falha de conexão com a API' };
        }
    }
}

/* ==========================================================================
   Auth Panel Actions
   ========================================================================== */
function initAuthTabs() {
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            
            // Switch tabs
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Switch forms
            loginForm.classList.remove('active');
            registerForm.classList.remove('active');
            
            if (tabName === 'login') {
                loginForm.classList.add('active');
            } else {
                registerForm.classList.add('active');
            }
        });
    });
}

function updateAuthUI() {
    if (state.token && state.user) {
        // Authenticated State
        userBadge.classList.remove('guest');
        userBadge.classList.add('authenticated');
        userBadgeText.textContent = `Olá, ${state.user.name}`;
        
        // Hide auth forms, show logged state
        loginForm.classList.remove('active');
        registerForm.classList.remove('active');
        document.querySelector('.auth-tabs').classList.add('hidden');
        authLoggedState.classList.remove('hidden');

        // Setup profile details
        loggedUserName.textContent = state.user.name;
        loggedUserEmail.textContent = state.user.email;
        jwtTokenPreview.textContent = state.token;

        // Initials avatar
        const initials = state.user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
        userAvatarInitials.textContent = initials;
    } else {
        // Guest State
        userBadge.classList.remove('authenticated');
        userBadge.classList.add('guest');
        userBadgeText.textContent = 'Visitante (Não Autenticado)';

        // Show tabs & forms
        document.querySelector('.auth-tabs').classList.remove('hidden');
        authLoggedState.classList.add('hidden');
        
        // Set active tab to login
        authTabs.forEach(t => t.classList.remove('active'));
        authTabs[0].classList.add('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');

        // Show table auth warning
        renderTableAuthWarning();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const data = await apiCall('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        // Save state
        state.token = data.token;
        state.user = { name: data.name, email: data.email };
        localStorage.setItem('upstock_token', data.token);
        localStorage.setItem('upstock_user', JSON.stringify(state.user));

        showToast('Login realizado com sucesso!', 'success');
        updateAuthUI();
        
        // Fetch products on login success
        fetchProducts();

        // Clear inputs
        loginForm.reset();
    } catch (err) {
        console.error(err);
        showToast('Falha no login. Verifique as credenciais.', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    try {
        const data = await apiCall('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });

        // Save state
        state.token = data.token;
        state.user = { name: data.name, email: data.email };
        localStorage.setItem('upstock_token', data.token);
        localStorage.setItem('upstock_user', JSON.stringify(state.user));

        showToast('Conta criada e autenticada!', 'success');
        updateAuthUI();
        
        // Fetch products on success
        fetchProducts();

        // Clear inputs
        registerForm.reset();
    } catch (err) {
        console.error(err);
        if (err.status === 499 || err.status === 409) {
            showToast('E-mail já cadastrado.', 'error');
        } else {
            showToast('Erro ao cadastrar usuário.', 'error');
        }
    }
}

function logout() {
    state.token = null;
    state.user = null;
    localStorage.removeItem('upstock_token');
    localStorage.removeItem('upstock_user');
    
    showToast('Sessão encerrada.', 'info');
    updateAuthUI();
    cancelEditing();
}

function copyTokenToClipboard() {
    if (!state.token) return;
    navigator.clipboard.writeText(state.token)
        .then(() => showToast('Token JWT copiado para a área de transferência!', 'success'))
        .catch(() => showToast('Não foi possível copiar o token.', 'error'));
}

/* ==========================================================================
   Product CRUD Lógica
   ========================================================================== */
function renderTableAuthWarning() {
    productsTbody.innerHTML = `
        <tr class="table-state-row">
            <td colspan="6">
                <div class="table-empty-state">
                    <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <span>Faça login para gerenciar e visualizar os produtos.</span>
                </div>
            </td>
        </tr>
    `;
}

async function fetchProducts() {
    productsTbody.innerHTML = `
        <tr class="table-state-row">
            <td colspan="6">
                <div class="table-loading-state">
                    <div class="spinner"></div>
                    <span>Carregando inventário...</span>
                </div>
            </td>
        </tr>
    `;

    try {
        const products = await apiCall('/api/products');
        
        if (products.length === 0) {
            productsTbody.innerHTML = `
                <tr class="table-state-row">
                    <td colspan="6">
                        <div class="table-empty-state">
                            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5">
                                <circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/>
                            </svg>
                            <span>Nenhum produto cadastrado no banco de dados.</span>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        productsTbody.innerHTML = '';
        products.forEach(product => {
            const tr = document.createElement('tr');
            
            // Format price to currency
            const formattedPrice = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(product.price);

            tr.innerHTML = `
                <td><code>#${product.id}</code></td>
                <td><strong>${escapeHtml(product.name)}</strong></td>
                <td><span class="text-secondary">${escapeHtml(product.description || '-')}</span></td>
                <td><span class="quantity-tag" style="font-weight: 500; color: var(--text-secondary);">${product.quantity || 0}</span></td>
                <td><span class="price-tag">${formattedPrice}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-secondary btn-icon" onclick="startEditProduct(${product.id}, '${escapeQuote(product.name)}', ${product.price}, ${product.quantity || 0}, '${escapeQuote(product.description || '')}')" title="Editar">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="btn btn-danger btn-icon" onclick="deleteProduct(${product.id})" title="Excluir">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </td>
            `;
            productsTbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
        productsTbody.innerHTML = `
            <tr class="table-state-row">
                <td colspan="6">
                    <div class="table-empty-state">
                        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--danger)">
                            <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <span class="text-danger">Erro ao carregar dados. Token expirado ou inválido.</span>
                    </div>
                </td>
            </tr>
        `;
    }
}

async function handleProductSubmit(e) {
    e.preventDefault();
    if (!state.token) {
        showToast('Você precisa estar logado para salvar produtos.', 'error');
        return;
    }

    const productData = {
        name: productNameInput.value,
        price: parseFloat(productPriceInput.value),
        quantity: parseInt(productQuantityInput.value) || 0,
        description: productDescriptionInput.value || null
    };

    try {
        if (state.editingProductId) {
            // Edit flow
            await apiCall(`/api/products/${state.editingProductId}`, {
                method: 'PUT',
                body: JSON.stringify(productData)
            });
            showToast('Produto atualizado com sucesso!', 'success');
        } else {
            // Create flow
            await apiCall('/api/products', {
                method: 'POST',
                body: JSON.stringify(productData)
            });
            showToast('Produto cadastrado com sucesso!', 'success');
        }

        // Clean up & refresh
        cancelEditing();
        fetchProducts();
    } catch (err) {
        console.error(err);
        showToast('Erro ao salvar produto. Verifique os campos.', 'error');
    }
}

// Bind to window for HTML onclick actions
window.startEditProduct = function(id, name, price, quantity, description) {
    state.editingProductId = id;
    
    // Fill fields
    productIdInput.value = id;
    productNameInput.value = name;
    productPriceInput.value = price;
    productQuantityInput.value = quantity;
    productDescriptionInput.value = description;

    // UI Updates
    productFormBadge.textContent = 'Editar';
    productFormBadge.style.background = 'var(--warning)';
    productFormTitle.textContent = `Editar Produto #${id}`;
    productFormSubtitle.textContent = 'Altere as informações do produto';
    btnCancelEdit.classList.remove('hidden');
    btnSubmitProduct.textContent = 'Atualizar Produto';
    btnSubmitProduct.className = 'btn btn-success btn-grow'; // style matches action
    
    // Scroll to form smoothly on mobile
    productFormCard.scrollIntoView({ behavior: 'smooth' });
};

function cancelEditing() {
    state.editingProductId = null;
    productForm.reset();
    productIdInput.value = '';

    // Reset UI state
    productFormBadge.textContent = 'Criar';
    productFormBadge.style.background = 'var(--primary)';
    productFormTitle.textContent = 'Gerenciar Produto';
    productFormSubtitle.textContent = 'Cadastre um novo item no banco de dados';
    btnCancelEdit.classList.add('hidden');
    btnSubmitProduct.textContent = 'Salvar Produto';
}

window.deleteProduct = async function(id) {
    if (!state.token) {
        showToast('Você precisa estar logado para excluir produtos.', 'error');
        return;
    }

    if (!confirm(`Tem certeza que deseja excluir o produto #${id}?`)) {
        return;
    }

    try {
        await apiCall(`/api/products/${id}`, {
            method: 'DELETE'
        });
        showToast('Produto excluído com sucesso.', 'success');
        
        // If we were editing this specific product, cancel it
        if (state.editingProductId === id) {
            cancelEditing();
        }
        
        fetchProducts();
    } catch (err) {
        console.error(err);
        showToast('Erro ao excluir produto.', 'error');
    }
};

/* ==========================================================================
   Utilities
   ========================================================================== */
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function escapeQuote(str) {
    if (!str) return '';
    return str
        .replace(/'/g, "\\'")
        .replace(/"/g, '&quot;');
}
