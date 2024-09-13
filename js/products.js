const products = {
    tableId: 'page-content-data__table',
    perPage: 15,
    currentPage: 1,
    totalProducts: 0,
    totalPages: 1,
    allProducts: null,
    firstButton: null,
    previousButton: null,
    nextButton: null,
    lastButton: null,
    pageNumberElement: null,
    totalPagesElement: null,
    pageDetailsElement: null,
    filterButtons: null,
    sort: null,
    sorted: [],

    /**
     * Fetch and append products to the table
     */
    loadProducts(productFilters)
    {
        this.setupPageButtons();
        this.fetchProducts((error, products) => {
            if (error) {
                alert(error)
            }
            else {
                if (typeof productFilters !== 'undefined') {
                    let numberOfProductFilters = Object.keys(productFilters).length;
                    this.allProducts = products
                        .filter(function (v) {
                            let found = 0;
                            Object.entries(productFilters).forEach(([filterType, filterValues]) => {
                                if (
                                    typeof v[filterType] !== 'undefined'
                                    && filterValues.includes(v[filterType])
                                ) {
                                    found++;
                                }
                            });

                            return found === numberOfProductFilters;
                        });
                } else {
                    productFilters = Array();
                    this.allProducts = products;
                }

                this.totalProducts = this.allProducts.length;
                this.totalPages = Math.ceil(this.totalProducts / this.perPage);
                this.getFilters(products, productFilters);
                this.getPage(this.currentPage);
            }
        });
    },

    /**
     * Setup pagination events
     */
    setupPageButtons()
    {
        this.firstButton = document.getElementById("first-button");
        this.firstButton.addEventListener('click', firstPage);

        this.previousButton = document.getElementById("previous-button");
        this.previousButton.addEventListener('click', previousPage);

        this.nextButton = document.getElementById("next-button");
        this.nextButton.addEventListener('click', nextPage);

        this.lastButton = document.getElementById("last-button");
        this.lastButton.addEventListener('click', lastPage);

        this.sort = document.getElementsByClassName("sort");
        for (let i = 0; i < this.sort.length; i++) {
            this.sort[i].addEventListener('click', sortProducts, false);
        }

        let filterButton = document.getElementById("apply-filter");
        filterButton.addEventListener('click', applyFilter);

        this.pageNumberElement = document.getElementById("page-number");
        this.totalPagesElement = document.getElementById("total-pages");
        this.pageDetailsElement = document.getElementById("page-details");

        this.filterButtons = document.getElementsByClassName("filter-button");
        for (let i = 0; i < this.filterButtons.length; i++) {
            this.filterButtons[i].addEventListener('click', toggleFilterPanel);
        }
    },

    /**
     * this.sort products
     *
     * @param e
     */
    sortProducts(e)
    {
        const sort_by = (field, reverse) => {
            const key = function (x) {
                if (field.indexOf('.') !== -1) {
                    let fields = field.split('.');
                    for (let i = 0; i < fields.length; i++) {
                        x = x[fields[i]];
                    }
                    return x;
                }
                return x[field]
            };
    
            reverse = !reverse ? 1 : -1;
    
            return function(a, b) {
                return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
            }
        }
    
        let sortIcon = e.target;
        let field = sortIcon.dataset.field;
        let currentSortOrder = (typeof this.sorted[field] !== 'undefined')
            ? this.sorted[field] : '';
        let sortOrder = '';
    
        if (currentSortOrder === '') {
            sortOrder = 'asc';
        } else if (currentSortOrder === 'asc') {
            sortOrder = 'desc';
        }
    
        this.sorted[field] = sortOrder;
        this.allProducts.sort(sort_by(field, (sortOrder === 'desc')));
    
        for (let i = 0; i < this.sort.length; i++) {
            this.removeClass(this.sort[i], 'fa-sort-asc');
            this.removeClass(this.sort[i], 'fa-sort-desc');
        }

        this.removeClass(e.target, 'fa-sort-' + currentSortOrder);
        this.addClass(e.target, 'fa-sort-' + sortOrder);

        this.getPage(1);
    },
    
    /**
     * Fetch the product from Fake Store API
     *
     * @param callback
     */
    fetchProducts(callback)
    {
        fetch('https://fakestoreapi.com/products')
            .then(response => response.json())
            .then(json => callback(null, json))
            .catch(error => callback(error, null))
    },
    
    /**
     * Append a page of products to the data table
     *
     * @param page
     */
    getPage(page)
    {
        let start = (page-1) * this.perPage;
        let productCount = this.allProducts.length;
    
        this.currentPage = page;
    
        if (start > productCount) {
            start = this.allProducts.length / this.perPage;
        } else if (start < 0) {
            start = 0
        }
        let end = start + this.perPage;
        if (end > productCount) {
            end = productCount
        }
    
        let content = document.createElement("tbody");
        for (let i = start; i < end; i++) {
            let product = this.allProducts[i];
            this.appendProduct(product, content);
        }
    
        let table = document.getElementById(this.tableId).getElementsByTagName('tbody')[0];
        table.replaceWith(content);

        this.updatePage(start, end);
    },
    
    /**
     * Append a product to the table
     *
     * @param product
     * @param table
     */
    appendProduct(product, table)
    {
        let tr = document.createElement('tr');
        tr.innerHTML = '<td><img class="imgbox" src="' + product.image + '" /></td>' +
            '<td><a href="#' + product.id +'">' + product.title + '</a></td>' +
            '<td>' + product.id + '</td>' +
            '<td>' + product.category + '</td>' +
            '<td>' + product.rating.rate + '(' + product.rating.count + ')</td>' +
            '<td>' + product.price + '</td>';
    
        table.appendChild(tr);
    },
    
    /**
     * Update page details and buttons
     *
     * @param start
     * @param end
     */
    updatePage(start, end)
    {
        if (this.currentPage === 1) {
            this.addClass(this.firstButton, "disabled");
            this.addClass(this.previousButton, "disabled");
        } else {
            this.removeClass(this.firstButton, "disabled");
            this.removeClass(this.previousButton, "disabled");
        }
    
        if (this.currentPage === this.totalPages) {
            this.addClass(this.nextButton, "disabled");
            this.addClass(this.lastButton, "disabled");
        } else {
            this.removeClass(this.nextButton, "disabled");
            this.removeClass(this.lastButton, "disabled");
        }
    
        this.pageNumberElement.innerHTML = this.currentPage;
        this.totalPagesElement.innerHTML = this.totalPages;
        this.pageDetailsElement.innerHTML = (start+1) + '-' + end + ' of ' + this.totalProducts;
    },
    
    /**
     * Go to first page
     */
    firstPage()
    {
        if (this.currentPage <= 1) {
            return;
        }
        this.getPage(1)
    },
    
    /**
     * Go to previous page
     */
    previousPage()
    {
        if (this.currentPage <= 1) {
            return;
        }
        this.getPage(this.currentPage-1)
    },
    
    /**
     * Go to next page
     */
    nextPage()
    {
        if (this.currentPage >= this.totalPages) {
            return;
        }
        this.getPage(this.currentPage+1)
    },
    
    /**
     * Go to last page
     */
    lastPage()
    {
        if (this.currentPage >= this.totalPages) {
            return;
        }
        this.getPage(this.totalPages)
    },
    
    /**
     * Open/Close filter
     *
     * @param open true|false // toggle if left empty
     */
    toggleFilterPanel(open)
    {
        const filterPanel = document.getElementById("filter-panel");
        const overlayPanel = document.getElementById("overlay");
        const forceOpen = (typeof open !== 'undefined') ? open : true;
    
        if (forceOpen && (" " + filterPanel.className + " ").indexOf(" open ") === -1) {
            this.addClass(filterPanel, "open");
            this.addClass(overlayPanel, "open");
        } else {
            this.removeClass(filterPanel, "open");
            this.removeClass(overlayPanel, "open");
        }
    },
    
    /**
     * Apply filter
     */
    applyFilter()
    {
        let filter = {
            'category': []
        };
    
        let categoryInputElements = document.getElementsByName('category[]');
    
        if (categoryInputElements.length > 0) {
            Object.entries(categoryInputElements).forEach(([filterType, filterValue]) => {
                if (filterValue.checked) {
                    filter['category'].push(filterValue.value);
                }
            });
        }
    
        this.loadProducts(filter);
        this.toggleFilterPanel(false);
    },
    
    /**
     * Get product filters
     *
     * @param products
     * @param productFilters
     */
    getFilters(products, productFilters)
    {
        let replaceHTML = '';
        let filterGroups = document.getElementById("filter_groups");
    
        replaceHTML += this.getCategories(products, productFilters);
    
        filterGroups.innerHTML = replaceHTML;
    },
    
    /**
     * List available categories in the filter
     *
     * @param products
     * @param productFilters
     *
     * @return string
     */
    getCategories(products, productFilters)
    {
        const categories = products
            .map(item => item.category)
            .filter(function (v, i, self) {
                return i === self.indexOf(v);
            });
    
        let list = '';
        Object.entries(categories).forEach(([filterType, categoryName]) => {
            list += this.appendCategory(categoryName, productFilters);
        });
    
        return '' +
            '<div class="filter__group">\n' +
            '    <div class="filter__title">Category</div>\n' +
            '    <div class="filter__list">\n' +
            '        ' + list +
            '    </div>\n' +
            '</div>\n';
    },
    
    /**
     * Append a product to the table
     *
     * @param categoryName
     * @param productFilters
     *
     * @return string
     */
    appendCategory(categoryName, productFilters)
    {
        const checked = productFilters.hasOwnProperty('category') && productFilters.category.includes(categoryName)
            ? 'checked="checked"'
            : '';
    
        return '' +
            '<label>' +
            '    <input type="checkbox" name="category[]" ' + checked + ' value="' + categoryName + '"> ' + categoryName +
            '</label>';
    },
    
    /**
     * Remove class from element
     *
     * @param element
     * @param className
     */
    removeClass(element, className)
    {
        element.classList.remove(className);
    },
    
    /**
     * Add class from element
     *
     * @param element
     * @param className
     */
    addClass(element, className)
    {
        element.classList.add(className);
    }
}

function firstPage()
{
    products.firstPage();
}

function previousPage()
{
    products.previousPage();
}

function nextPage()
{
    products.nextPage();
}

function lastPage()
{
    products.lastPage();
}

function sortProducts(e)
{
    products.sortProducts(e);
}

function applyFilter()
{
    products.applyFilter();
}

function toggleFilterPanel()
{
    products.toggleFilterPanel();
}
