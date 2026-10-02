/* ----------------------------------------------------------------- */
/* PHASE 5D & 5E-2: ADMIN PANEL & EDGE FUNCTION USER CREATION        */
/* ----------------------------------------------------------------- */
let adminMembersData = [];
let adminSearchTerm = "";
let adminFilterStatus = "all";
const ADMIN_PAGE_SIZE = 20;
let adminCurrentPage = 1;

function escapeAdminHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

async function loadAdminProfiles() {
    try {
        if (!currentUser.loggedIn || currentUser.role !== 'admin') {
            console.warn('[Admin] Unauthorized load attempt blocked.');
            return;
        }
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        adminMembersData = data || [];
        renderAdminTable();
        updateAdminStats();
    } catch (err) {
        console.error("Admin Load Error:", err);
    }
}

function handleAdminSearch() {
    adminSearchTerm = document.getElementById('adminSearchInput').value.toLowerCase();
    adminCurrentPage = 1;
    renderAdminTable();
}

function handleAdminFilter() {
    adminFilterStatus = document.getElementById('adminFilterSelect').value;
    adminCurrentPage = 1;
    renderAdminTable();
}

function updateAdminStats() {
    const total = adminMembersData.length;
    const active = adminMembersData.filter(m => m.status === 'active').length;
    const inactive = adminMembersData.filter(m => m.status !== 'active').length;
    const admins = adminMembersData.filter(m => m.role === 'admin').length;

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statActive').textContent = active;
    document.getElementById('statInactive').textContent = inactive;
    document.getElementById('statAdmin').textContent = admins;
}

function renderAdminTable() {
    const tbody = document.getElementById('adminTableBody');

    const filteredData = adminMembersData.filter(member => {
        const matchSearch = (member.full_name || '').toLowerCase().includes(adminSearchTerm) ||
                            (member.email || '').toLowerCase().includes(adminSearchTerm);

        let matchFilter = true;
        if (adminFilterStatus === 'active') matchFilter = member.status === 'active';
        if (adminFilterStatus === 'inactive') matchFilter = member.status !== 'active';
        if (adminFilterStatus === 'admin') matchFilter = member.role === 'admin';

        return matchSearch && matchFilter;
    });

    const totalPages = Math.max(1, Math.ceil(filteredData.length / ADMIN_PAGE_SIZE));
    if (adminCurrentPage > totalPages) adminCurrentPage = totalPages;
    if (adminCurrentPage < 1) adminCurrentPage = 1;
    const startIdx = (adminCurrentPage - 1) * ADMIN_PAGE_SIZE;
    const endIdx = startIdx + ADMIN_PAGE_SIZE;
    const pageData = filteredData.slice(startIdx, endIdx);

    if (filteredData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="px-5 py-8 text-center text-gray-500">Tidak ada member yang sesuai kriteria.</td></tr>`;
        renderAdminPagination(0, 1);
        return;
    }

    tbody.innerHTML = pageData.map(member => {
        const isMe = member.id === currentUser.userId;
        const statusColor = member.status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30';
        const roleColor = member.role === 'admin' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-purple-500/20 text-purple-300 border-purple-500/30';

        const safeId = escapeAdminHtml(member.id);
        const safeName = escapeAdminHtml(member.full_name || 'Tanpa Nama');
        const safeEmail = escapeAdminHtml(member.email || '');
        const safeRole = escapeAdminHtml(member.role || 'member');
        const safeStatus = escapeAdminHtml(member.status || 'active');

        return `
            <tr class="hover:bg-white/5 transition">
                <td class="px-5 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                        <span class="font-bold text-white">${safeName}</span>
                        ${isMe ? '<span class="text-[9px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded border border-white/20 uppercase">Kamu</span>' : ''}
                    </div>
                </td>
                <td class="px-5 py-4 whitespace-nowrap text-gray-400">${safeEmail}</td>
                <td class="px-5 py-4 whitespace-nowrap">
                    <span class="inline-block border px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${roleColor}">${safeRole}</span>
                </td>
                <td class="px-5 py-4 whitespace-nowrap">
                    <span class="inline-block border px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusColor}">${safeStatus}</span>
                </td>
                <td class="px-5 py-4 whitespace-nowrap text-gray-500 text-[10px] font-mono">
                    ${new Date(member.created_at).toLocaleDateString('id-ID')}
                </td>
                <td class="px-5 py-4 whitespace-nowrap text-right">
                    <button onclick="openEditMemberModal('${safeId}')" class="text-[10px] bg-white/5 hover:bg-pink-600/30 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-pink-500/50 transition font-bold shadow-sm">
                        Edit Profil
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    renderAdminPagination(filteredData.length, totalPages);
}

function renderAdminPagination(totalCount, totalPages) {
    const bar = document.getElementById('adminPaginationBar');
    if (!bar) return;
    if (totalCount === 0) {
        bar.innerHTML = '';
        return;
    }
    const startItem = (adminCurrentPage - 1) * ADMIN_PAGE_SIZE + 1;
    const endItem = Math.min(adminCurrentPage * ADMIN_PAGE_SIZE, totalCount);
    const isFirst = adminCurrentPage <= 1;
    const isLast = adminCurrentPage >= totalPages;
    const btnBase = 'inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg border transition';
    const btnEnabled = 'bg-white/5 hover:bg-purple-600/30 text-gray-200 hover:text-white border-white/10 hover:border-purple-500/50';
    const btnDisabled = 'bg-white/[0.02] text-gray-600 border-white/5 cursor-not-allowed';
    bar.innerHTML = `
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-white/10 bg-black/30">
            <div class="text-[11px] text-gray-400 font-medium">
                Menampilkan <span class="text-white font-bold">${startItem}–${endItem}</span> dari <span class="text-white font-bold">${totalCount}</span> member
            </div>
            <div class="flex items-center gap-2">
                <button type="button" onclick="adminPrevPage()" ${isFirst ? 'disabled' : ''} class="${btnBase} ${isFirst ? btnDisabled : btnEnabled}">
                    <i class="fa-solid fa-chevron-left text-[10px]"></i>
                    <span>Prev</span>
                </button>
                <span class="text-[11px] text-gray-300 font-mono px-2">Halaman ${adminCurrentPage} / ${totalPages}</span>
                <button type="button" onclick="adminNextPage()" ${isLast ? 'disabled' : ''} class="${btnBase} ${isLast ? btnDisabled : btnEnabled}">
                    <span>Next</span>
                    <i class="fa-solid fa-chevron-right text-[10px]"></i>
                </button>
            </div>
        </div>
    `;
}

function adminPrevPage() {
    if (adminCurrentPage > 1) {
        adminCurrentPage -= 1;
        renderAdminTable();
    }
}

function adminNextPage() {
    adminCurrentPage += 1;
    renderAdminTable();
}

function openEditMemberModal(id) {
    const member = adminMembersData.find(m => m.id === id);
    if(!member) return;

    const noticeEl = document.getElementById('editMemberNotice');
    if (noticeEl) {
        noticeEl.className = 'hidden text-[11px] p-3 rounded-xl border font-medium';
        noticeEl.textContent = '';
    }

    document.getElementById('editMemberId').value = member.id;
    document.getElementById('editMemberName').value = member.full_name || '';
    document.getElementById('editMemberRole').value = member.role || 'member';
    document.getElementById('editMemberStatus').value = member.status || 'active';

    document.getElementById('editMemberModal').classList.remove('hidden');
}

function closeEditMemberModal() {
    document.getElementById('editMemberModal').classList.add('hidden');
}

async function saveEditMember() {
    const id = document.getElementById('editMemberId').value;
    const name = document.getElementById('editMemberName').value.trim();
    const role = document.getElementById('editMemberRole').value;
    const status = document.getElementById('editMemberStatus').value;

    if (id === currentUser.userId && role !== 'admin') {
        showEditMemberNotice("Keamanan: Anda tidak dapat mencabut akses admin dari akun Anda sendiri.", "error");
        return;
    }

    if (id === currentUser.userId && status !== 'active') {
        showEditMemberNotice("Keamanan: Anda tidak dapat menonaktifkan akun Anda sendiri.", "error");
        return;
    }

    if (!name) {
        showEditMemberNotice('Nama Lengkap wajib diisi.', 'error');
        return;
    }

    try {
        const { error } = await supabaseClient
            .from('profiles')
            .update({
                full_name: name,
                role: role,
                status: status,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) throw error;

        showEditMemberNotice('Profil member berhasil diperbarui.', 'success');
        await new Promise(r => setTimeout(r, 1100));
        closeEditMemberModal();
        loadAdminProfiles();
    } catch (err) {
        console.error("Save Edit Error:", err);
        const message = (err && err.message) ? err.message : 'Gagal memperbarui profil member.';
        showEditMemberNotice(message, 'error');
    }
}

/* --- ADD MEMBER MODAL FUNCTIONS (PHASE 5E-2 REAL EDGE FUNCTION CONNECTED) --- */
function openAddMemberModal() {
    document.getElementById('addMemberName').value = '';
    document.getElementById('addMemberEmail').value = '';
    document.getElementById('addMemberPassword').value = '';
    document.getElementById('addMemberRole').value = 'member';
    document.getElementById('addMemberStatus').value = 'active';

    const noticeEl = document.getElementById('addMemberNotice');
    if (noticeEl) {
        noticeEl.className = 'hidden text-[11px] p-3 rounded-xl border font-medium';
        noticeEl.textContent = '';
    }

    document.getElementById('addMemberModal').classList.remove('hidden');
    setTimeout(() => {
        const nameInput = document.getElementById('addMemberName');
        if (nameInput) nameInput.focus();
    }, 50);
}

function closeAddMemberModal() {
    document.getElementById('addMemberPassword').value = '';
    document.getElementById('addMemberName').value = '';
    document.getElementById('addMemberEmail').value = '';
    document.getElementById('addMemberModal').classList.add('hidden');
}

async function handleAddMemberSubmit(event) {
    if (event) event.preventDefault();

    const name = document.getElementById('addMemberName').value.trim();
    const email = document.getElementById('addMemberEmail').value.trim();
    const password = document.getElementById('addMemberPassword').value.trim();
    const role = document.getElementById('addMemberRole').value;
    const status = document.getElementById('addMemberStatus').value;
    const submitBtn = document.getElementById('btnAddMemberSubmit');

    // Frontend Validation
    if (!name) {
        showAddMemberNotice('Nama Lengkap wajib diisi.', 'error');
        return;
    }
    if (!email) {
        showAddMemberNotice('Email wajib diisi.', 'error');
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAddMemberNotice('Format Email tidak valid.', 'error');
        return;
    }
    if (!password) {
        showAddMemberNotice('Password wajib diisi.', 'error');
        return;
    }
    if (password.length < 6) {
        showAddMemberNotice('Password minimal 6 karakter.', 'error');
        return;
    }
    if (!role || !status) {
        showAddMemberNotice('Role dan Status wajib dipilih.', 'error');
        return;
    }

    if (!currentUser.loggedIn || currentUser.role !== 'admin') {
        showAddMemberNotice('Hanya admin yang boleh menambah member.', 'error');
        return;
    }

    console.log("[ADD MEMBER] Requesting create-member");

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> <span>Membuat member...</span>`;
    showAddMemberNotice('Memproses pembuatan akun di server...', 'info');

    try {
        const responseData = await invokeCreateMember({ name, email, password, role, status });
        console.log("[ADD MEMBER] Success:", { id: responseData && responseData.user && responseData.user.id, email: responseData && responseData.user && responseData.user.email });
        showAddMemberNotice('Member berhasil dibuat.', 'success');
        await new Promise(r => setTimeout(r, 1100));
        closeAddMemberModal();
        loadAdminProfiles();
    } catch (err) {
        console.error("[ADD MEMBER] Failed:", err && err.message);
        showAddMemberNotice((err && err.message) || 'Gagal membuat member.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Tambah Member</span>`;
    }
}

async function invokeCreateMember(payload) {
    if (!supabaseClient) throw new Error('Supabase belum terhubung.');
    const { data: sessWrap, error: sessErr } = await supabaseClient.auth.getSession();
    if (sessErr) throw new Error('Tidak bisa membaca sesi admin. Login ulang lalu coba lagi.');
    const token = sessWrap && sessWrap.session && sessWrap.session.access_token;
    if (!token) throw new Error('Sesi admin tidak valid. Login ulang lalu coba lagi.');

    let response;
    try {
        response = await fetch(SUPABASE_URL + '/functions/v1/create-member', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_PUBLISHABLE_KEY,
                'Authorization': 'Bearer ' + token,
                'x-client-info': 'TRENDORA-ai/admin'
            },
            body: JSON.stringify(payload)
        });
    } catch (netErr) {
        throw new Error('Tidak bisa menghubungi server tambah member. Cek koneksi internet.');
    }

    const raw = await response.text();
    let data = null;
    try { data = raw ? JSON.parse(raw) : null; } catch (e) { data = null; }

    if (!response.ok) {
        if (data && data.error) throw new Error(data.error);
        if (response.status === 401) throw new Error('Sesi tidak valid atau kadaluarsa. Login ulang sebagai admin.');
        if (response.status === 403) throw new Error('Hanya admin yang boleh menambah member.');
        if (response.status === 409) throw new Error('Email sudah terdaftar.');
        throw new Error('Gagal membuat member (HTTP ' + response.status + ').');
    }
    if (data && data.error) throw new Error(data.error);
    return data || {};
}

function showAddMemberNotice(msg, type) {
    const noticeEl = document.getElementById('addMemberNotice');
    if (!noticeEl) return;

    if (type === 'error') {
        noticeEl.className = 'text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl font-medium block';
    } else if (type === 'success') {
        noticeEl.className = 'text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl font-medium block';
    } else {
        noticeEl.className = 'text-[11px] text-purple-300 bg-purple-500/10 border border-purple-500/20 p-3 rounded-xl font-medium block';
    }
    noticeEl.textContent = msg;
}

function showEditMemberNotice(msg, type) {
    const noticeEl = document.getElementById('editMemberNotice');
    if (!noticeEl) return;

    if (type === 'error') {
        noticeEl.className = 'text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl font-medium block';
    } else if (type === 'success') {
        noticeEl.className = 'text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl font-medium block';
    } else {
        noticeEl.className = 'text-[11px] text-pink-300 bg-pink-500/10 border border-pink-500/20 p-3 rounded-xl font-medium block';
    }
    noticeEl.textContent = msg;
}
