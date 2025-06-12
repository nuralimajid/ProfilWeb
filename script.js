document.addEventListener('DOMContentLoaded', () => {
    // Google Sheets API Configuration
    const API_KEY = 'AIzaSyDGXlFYI_mV9diljGAClxgZzEtd9oxbMyw'; // Ganti dengan API Key Anda
    const SPREADSHEET_ID = 'https://docs.google.com/spreadsheets/d/1nnsT6GH5p6MF4zZ24ExsAB7jqjbbU2ml1hHPPbPfAuI/edit?usp=sharing'; // Ganti dengan Spreadsheet ID Google Sheet Anda

    // Referensi ke elemen yang ada di index.html
    const profilePhoto = document.getElementById('profilePhoto');
    const changePhotoBtn = document.getElementById('changePhotoBtn'); // Tetap ada untuk edit lokal
    const photoUpload = document.getElementById('photoUpload'); // Tetap ada untuk edit lokal
    const aboutMe = document.getElementById('aboutMe');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const linkedin = document.getElementById('linkedin');
    const github = document.getElementById('github');
    const educationList = document.getElementById('educationList');
    const experienceList = document.getElementById('experienceList');
    const softSkillsList = document.getElementById('softSkillsList');
    const addItemBtns = document.querySelectorAll('.add-item-btn');

    let isEditMode = false;
    let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    let editBtn;
    if (isLoggedIn) {
        editBtn = document.createElement('button');
        editBtn.id = 'editBtn';
        editBtn.textContent = 'Edit Profil';
        const header = document.querySelector('header');
        if (header) {
            header.appendChild(editBtn);
            editBtn.addEventListener('click', toggleEditMode);
        } else {
            console.error("Header element not found. Cannot append edit button.");
        }
    }

    let currentProfileData = {};

    // --- FUNGSI UTAMA ---

    // 1. Memuat Data dari LocalStorage atau Google Sheets API
    async function loadProfileData() {
        const storedData = localStorage.getItem('personalProfileData');
        if (storedData) {
            currentProfileData = JSON.parse(storedData);
            console.log('Data dimuat dari LocalStorage.');
        } else {
            // Jika tidak ada di localStorage, muat dari Google Sheets
            try {
                const profileResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Profil!A:G?key=${API_KEY}`);
                const eduResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Pendidikan!A:E?key=${API_KEY}`);
                const expResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/PengalamanKerja!A:E?key=${API_KEY}`);
                const skillResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/SoftSkills!A:B?key=${API_KEY}`);

                if (!profileResponse.ok || !eduResponse.ok || !expResponse.ok || !skillResponse.ok) {
                    throw new Error(`HTTP error! status: ${profileResponse.status || eduResponse.status || expResponse.status || skillResponse.status}`);
                }

                const profileData = await profileResponse.json();
                const eduData = await eduResponse.json();
                const expData = await expResponse.json();
                const skillData = await skillResponse.json();

                // Fungsi pembantu untuk mengonversi data array dari Sheet ke objek
                const parseSheetData = (values) => {
                    if (!values || values.length < 2) return [];
                    const headers = values[0];
                    return values.slice(1).map(row => {
                        const obj = {};
                        headers.forEach((header, index) => {
                            obj[header] = row[index] || ''; // Gunakan string kosong jika data kosong
                        });
                        return obj;
                    });
                };

                const parsedProfile = parseSheetData(profileData.values)[0] || {}; // Ambil baris pertama untuk profil
                const parsedEdu = parseSheetData(eduData.values);
                const parsedExp = parseSheetData(expData.values);
                const parsedSkill = parseSheetData(skillData.values).map(item => item.skill); // Ambil hanya nilai 'skill'

                currentProfileData = {
                    profile: {
                        photo: parsedProfile.photo || "https://via.placeholder.com/150",
                        aboutMe: parsedProfile.aboutMe || "Tidak ada deskripsi.",
                        contact: {
                            email: parsedProfile.email || "",
                            phone: parsedProfile.phone || "",
                            linkedin: parsedProfile.linkedin || "#",
                            github: parsedProfile.github || "#"
                        }
                    },
                    details: {
                        education: parsedEdu,
                        experience: parsedExp,
                        softSkills: parsedSkill
                    }
                };
                console.log('Data dimuat dari Google Sheets.');
                // Simpan data dari Google Sheets ke localStorage untuk penggunaan selanjutnya
                localStorage.setItem('personalProfileData', JSON.stringify(currentProfileData));

            } catch (error) {
                console.error('Gagal memuat data dari Google Sheets:', error);
                // Fallback data jika Google Sheets API gagal dimuat
                currentProfileData = {
                    profile: {
                        photo: "https://via.placeholder.com/150",
                        aboutMe: "Gagal memuat deskripsi. Silakan edit.",
                        contact: { email: "error@example.com", phone: "N/A", linkedin: "#", github: "#" }
                    },
                    details: {
                        education: [{ title: "Tidak ada data pendidikan", institution: "", years: "" }],
                        experience: [{ title: "Tidak ada data pengalaman", company: "", years: "", description: "" }],
                        softSkills: ["Tidak ada data soft skill"]
                    }
                };
            }
        }
        displayProfileData(currentProfileData);
        updateEditModeUI();
    }

    // 2. Menampilkan Data ke HTML (Fungsi ini tidak berubah)
    function displayProfileData(data) {
        profilePhoto.src = data.profile.photo;
        aboutMe.textContent = data.profile.aboutMe;
        email.textContent = data.profile.contact.email;
        phone.textContent = data.profile.contact.phone;
        linkedin.href = data.profile.contact.linkedin;
        linkedin.textContent = data.profile.contact.linkedin.replace(/^(https?:\/\/)?(www\.)?linkedin\.com\/in\//, '').replace(/\/$/, '');
        github.href = data.profile.contact.github;
        github.textContent = data.profile.contact.github.replace(/^(https?:\/\/)?(www\.)?github\.com\//, '').replace(/\/$/, '');

        renderList(educationList, data.details.education, 'education');
        renderList(experienceList, data.details.experience, 'experience');
        renderList(softSkillsList, data.details.softSkills, 'softSkills');
    }

    // Fungsi pembantu untuk merender daftar (Pendidikan, Pengalaman, Soft Skills) - tidak berubah banyak
    function renderList(container, items, type) {
        container.innerHTML = '';
        if (!items || items.length === 0) {
            container.innerHTML = `<p class="placeholder-text">Tidak ada data ${type} yang tersedia.</p>`;
            return;
        }

        items.forEach((item, index) => {
            const div = document.createElement('div');
            div.classList.add('item-entry');
            div.dataset.index = index;

            if (type === 'education') {
                div.innerHTML = `
                    <p data-field="title"><strong>${item.title}</strong> - <span data-field="institution">${item.institution}</span> (<span data-field="years">${item.years}</span>)</p>
                    <p class="item-description" data-field="description">${item.description}</p>
                `;
            } else if (type === 'experience') {
                div.innerHTML = `
                    <p data-field="title"><strong>${item.title}</strong> - <span data-field="company">${item.company}</span> (<span data-field="years">${item.years}</span>)</p>
                    <ul>
                        <li class="item-description" data-field="description">${item.description}</li>
                    </ul>
                `;
            } else if (type === 'softSkills') {
                const ul = document.createElement('ul');
                const li = document.createElement('li');
                li.textContent = item;
                li.dataset.field = 'skill';
                ul.appendChild(li);
                div.appendChild(ul);
            }

            if (isEditMode && isLoggedIn) {
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Hapus';
                deleteBtn.classList.add('delete-item-btn');
                deleteBtn.addEventListener('click', () => deleteItem(type, index));
                div.appendChild(deleteBtn);
            }

            container.appendChild(div);
        });
    }

    // 3. Mengaktifkan/ Menonaktifkan Mode Edit (Fungsi ini tidak berubah signifikan)
    function toggleEditMode() {
        if (!isLoggedIn) {
            alert("Anda harus login untuk mengedit profil. Silakan akses /login-page.html");
            return;
        }

        isEditMode = !isEditMode;
        if (editBtn) {
            editBtn.textContent = isEditMode ? 'Simpan Perubahan' : 'Edit Profil';
            editBtn.style.backgroundColor = isEditMode ? 'var(--secondary-color)' : 'var(--primary-color)';
            editBtn.classList.toggle('active-edit-mode', isEditMode);
        }

        document.querySelectorAll('.edit-mode-only').forEach(el => {
            el.style.display = isEditMode ? 'inline-block' : 'none';
        });

        toggleContentEditable(aboutMe, 'p');
        toggleContentEditable(email, 'span');
        toggleContentEditable(phone, 'span');

        if (isEditMode) {
            replaceWithInputField(linkedin, 'href', 'url');
            replaceWithInputField(github, 'href', 'url');
        } else {
            replaceWithAnchor(linkedin);
            replaceWithAnchor(github);
        }

        toggleListEdit(educationList, 'education');
        toggleListEdit(experienceList, 'experience');
        toggleListEdit(softSkillsList, 'softSkills');

        if (!isEditMode) {
            saveProfileData();
            displayProfileData(currentProfileData);
            // Penting: Setelah menyimpan data ke localStorage,
            // kita tidak akan langsung menulisnya ke Google Sheets dari sini
            // karena itu butuh otentikasi lebih kompleks atau Apps Script.
            // Data akan tetap tersimpan di localStorage browser ini.
        }
    }

    // Fungsi pembantu untuk toggle contenteditable (tidak berubah)
    function toggleContentEditable(element, tagName) {
        if (element.tagName.toLowerCase() === tagName) {
            element.contentEditable = isEditMode;
            element.classList.toggle('editable-field', isEditMode);
        }
    }

    // Fungsi untuk mengganti elemen dengan input field (tidak berubah)
    function replaceWithInputField(element, dataAttribute, type = 'text') {
        const value = element.getAttribute(dataAttribute) || element.textContent;
        const input = document.createElement('input');
        input.type = type;
        input.value = value;
        input.classList.add('editable-input');
        input.dataset.originalElementId = element.id;

        element.dataset.inputField = 'true';
        element.style.display = 'none';
        element.parentNode.insertBefore(input, element);
    }

    // Fungsi untuk mengembalikan input field ke elemen anchor (tidak berubah)
    function replaceWithAnchor(element) {
        const input = element.previousElementSibling;
        if (input && input.tagName.toLowerCase() === 'input' && input.dataset.originalElementId === element.id) {
            const newValue = input.value;
            element.href = newValue;
            element.textContent = newValue.replace(/^(https?:\/\/)?(www\.)?linkedin\.com\/in\//, '').replace(/\/$/, '').replace(/^(https?:\/\/)?(www\.)?github\.com\//, '').replace(/\/$/, '');
            element.style.display = 'inline';
            input.remove();
        }
    }

    // Fungsi untuk mengaktifkan/menonaktifkan edit untuk daftar item (tidak berubah)
    function toggleListEdit(container, type) {
        const items = container.querySelectorAll('.item-entry');
        items.forEach(itemDiv => {
            if (type === 'education' || type === 'experience') {
                const titleEl = itemDiv.querySelector('[data-field="title"]');
                const institutionEl = itemDiv.querySelector('[data-field="institution"], [data-field="company"]');
                const yearsEl = itemDiv.querySelector('[data-field="years"]');
                const descriptionEl = itemDiv.querySelector('[data-field="description"]');

                if (titleEl) toggleContentEditable(titleEl, titleEl.tagName.toLowerCase());
                if (institutionEl) toggleContentEditable(institutionEl, institutionEl.tagName.toLowerCase());
                if (yearsEl) toggleContentEditable(yearsEl, yearsEl.tagName.toLowerCase());
                if (descriptionEl) toggleContentEditable(descriptionEl, descriptionEl.tagName.toLowerCase());

            } else if (type === 'softSkills') {
                const skillEl = itemDiv.querySelector('[data-field="skill"]');
                if (skillEl) toggleContentEditable(skillEl, skillEl.tagName.toLowerCase());
            }

            const deleteBtn = itemDiv.querySelector('.delete-item-btn');
            if (deleteBtn) {
                deleteBtn.style.display = (isEditMode && isLoggedIn) ? 'inline-block' : 'none';
            }
        });
    }

    // 4. Menyimpan Data ke LocalStorage (Fungsi ini tidak berubah)
    function saveProfileData() {
        const updatedData = {
            profile: {
                photo: profilePhoto.src,
                aboutMe: aboutMe.textContent.trim(),
                contact: {
                    email: email.textContent.trim(),
                    phone: phone.textContent.trim(),
                    linkedin: document.querySelector('#linkedin').dataset.inputField ?
                                document.querySelector('#linkedin').previousElementSibling.value :
                                linkedin.href,
                    github: document.querySelector('#github').dataset.inputField ?
                                document.querySelector('#github').previousElementSibling.value :
                                github.href
                }
            },
            details: {
                education: getListData(educationList, 'education'),
                experience: getListData(experienceList, 'experience'),
                softSkills: getListData(softSkillsList, 'softSkills')
            }
        };

        localStorage.setItem('personalProfileData', JSON.stringify(updatedData));
        currentProfileData = updatedData;
        console.log('Data disimpan ke LocalStorage.');
    }

    // Fungsi pembantu untuk mengambil data dari daftar (tidak berubah)
    function getListData(container, type) {
        const items = [];
        container.querySelectorAll('.item-entry').forEach(itemDiv => {
            if (type === 'education') {
                items.push({
                    title: itemDiv.querySelector('[data-field="title"]').textContent.trim(),
                    institution: itemDiv.querySelector('[data-field="institution"]').textContent.trim(),
                    years: itemDiv.querySelector('[data-field="years"]').textContent.trim(),
                    description: itemDiv.querySelector('[data-field="description"]').textContent.trim()
                });
            } else if (type === 'experience') {
                items.push({
                    title: itemDiv.querySelector('[data-field="title"]').textContent.trim(),
                    company: itemDiv.querySelector('[data-field="company"]').textContent.trim(),
                    years: itemDiv.querySelector('[data-field="years"]').textContent.trim(),
                    description: itemDiv.querySelector('[data-field="description"]').textContent.trim()
                });
            } else if (type === 'softSkills') {
                items.push(itemDiv.querySelector('[data-field="skill"]').textContent.trim());
            }
        });
        return items;
    }

    // --- FUNGSI TAMBAHAN ---

    // 5. Mengganti Foto Profil (tidak berubah)
    changePhotoBtn.addEventListener('click', () => {
        photoUpload.click();
    });

    photoUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                profilePhoto.src = e.target.result;
                currentProfileData.profile.photo = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // 6. Menambah Item Baru (tidak berubah)
    addItemBtns.forEach(button => {
        button.addEventListener('click', (event) => {
            const targetType = event.target.dataset.target;
            addItem(targetType);
        });
    });

    function addItem(type) {
        saveProfileData();
        let dataToModify = JSON.parse(JSON.stringify(currentProfileData));

        const listContainer = document.getElementById(`${type}List`);
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('item-entry');

        let newItem = {};
        if (type === 'education') {
            newItem = { title: "Pendidikan Baru", institution: "Institusi", years: "Tahun", description: "Deskripsi Pendidikan" };
            itemDiv.innerHTML = `
                <p data-field="title" contenteditable="true"><strong>${newItem.title}</strong> - <span data-field="institution" contenteditable="true">${newItem.institution}</span> (<span data-field="years" contenteditable="true">${newItem.years}</span>)</p>
                <p class="item-description" data-field="description" contenteditable="true">${newItem.description}</p>
            `;
        } else if (type === 'experience') {
            newItem = { title: "Posisi Baru", company: "Perusahaan", years: "Tahun", description: "Deskripsi Pengalaman" };
            itemDiv.innerHTML = `
                <p data-field="title" contenteditable="true"><strong>${newItem.title}</strong> - <span data-field="company" contenteditable="true">${newItem.company}</span> (<span data-field="years" contenteditable="true">${newItem.years}</span>)</p>
                <ul>
                    <li class="item-description" data-field="description" contenteditable="true">${newItem.description}</li>
                </ul>
            `;
        } else if (type === 'softSkills') {
            newItem = "Soft Skill Baru";
            const ul = document.createElement('ul');
            const li = document.createElement('li');
            li.textContent = newItem;
            li.dataset.field = 'skill';
            li.contentEditable = true;
            ul.appendChild(li);
            itemDiv.appendChild(ul);
        }

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Hapus';
        deleteBtn.classList.add('delete-item-btn');
        deleteBtn.addEventListener('click', () => deleteItem(type, dataToModify.details[type].length));
        itemDiv.appendChild(deleteBtn);

        dataToModify.details[type].push(newItem);
        localStorage.setItem('personalProfileData', JSON.stringify(dataToModify));
        currentProfileData = dataToModify;
        
        renderList(listContainer, currentProfileData.details[type], type);
        toggleListEdit(listContainer, type);
    }

    // Fungsi untuk menghapus item (tidak berubah)
    function deleteItem(type, index) {
        let dataToModify = JSON.parse(localStorage.getItem('personalProfileData')) || {};
        if (!dataToModify.details || !dataToModify.details[type]) {
            console.warn("Data details atau type tidak ditemukan saat menghapus.");
            return;
        }

        if (index >= 0 && index < dataToModify.details[type].length) {
            dataToModify.details[type].splice(index, 1);
            localStorage.setItem('personalProfileData', JSON.stringify(dataToModify));
            currentProfileData = dataToModify;
            renderList(document.getElementById(`${type}List`), currentProfileData.details[type], type);
            toggleListEdit(document.getElementById(`${type}List`), type);
        } else {
            console.warn(`Indeks ${index} untuk tipe ${type} tidak valid.`);
        }
    }

    // Fungsi untuk memperbarui tampilan UI mode edit (khusus untuk index.html) - tidak berubah
    function updateEditModeUI() {
        const editModeElements = document.querySelectorAll('.edit-mode-only');
        editModeElements.forEach(el => {
            el.style.display = isLoggedIn ? 'inline-block' : 'none';
        });

        if (!isLoggedIn) {
            aboutMe.contentEditable = false;
            email.contentEditable = false;
            phone.contentEditable = false;
            replaceWithAnchor(linkedin);
            replaceWithAnchor(github);
        }
        
        toggleListEdit(educationList, 'education');
        toggleListEdit(experienceList, 'experience');
        toggleListEdit(softSkillsList, 'softSkills');
    }

    // Muat data saat halaman pertama kali dimuat
    loadProfileData();
});