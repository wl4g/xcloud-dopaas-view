import {transDate, getDay} from 'utils/'

export default {
    name: 'host',
    data() {
        return {
            //查询条件
            searchParams: {
                domainId: '',
                zone: '',
                host: '',
            },

            //分页信息
            total: 0,
            pageNum: 1,
            pageSize: 10,

            //弹窗表单
            saveForm: {
                id: '',
                domainId: '',
                host: '',
                resolveType: 'a',
                value: '',
                ttl: '300',
                priority: '',
                lineIsp: 'default',
            },

            dialogVisible: false,
            dialogTitle: '',
            dialogLoading: false,

            tableData: [],

            // 表单规则
            rules: {
                host: [
                    {required: true, message: 'Please Input name', trigger: 'blur' },
                ],
            },
            loading: false
        }
    },

    activated() {
        if (this.$route.query.id) {
            this.searchParams.domainId = this.$route.query.id;
        }
        if(this.$route.query.zone){
            this.searchParams.zone = this.$route.query.zone;
        }
        this.getData();
    },

    methods: {

        onSubmit() {
            this.getData();
        },

        currentChange(i) {
            this.pageNum = i;
            this.getData();
        },

        addData() {
            this.cleanSaveForm();
            this.dialogVisible = true;
            this.dialogTitle = 'Add Host Netcard information';
        },

        // 获取列表数据
        getData() {
            this.loading = true;
            this.$$api_erm_dnsPrivateResolutionList({
                data: {
                    domainId: this.searchParams.domainId,
                    host: this.searchParams.host,
                    pageNum: this.pageNum,
                    pageSize: this.pageSize,
                },
                fn: data => {
                    this.loading = false;
                    this.total = data.data.total;
                    this.tableData = data.data.records;
                },
                errFn: () => {
                    this.loading = false;
                }
            })
        },

        cleanSaveForm() {
            this.saveForm = {
                id: '',
                domainId: '',
                host: '',
                resolveType: 'a',
                value: '',
                ttl: '300',
                priority: '',
                lineIsp: 'default',
            };
        },

        saveData() {
            this.dialogLoading = true;
            this.saveForm.hostId = this.searchParams.hostId;
            this.$refs['saveForm'].validate((valid) => {
                if (valid) {
                    this.saveForm.domainId = this.searchParams.domainId;
                    this.$$api_erm_saveDnsPrivateResolution({
                        data: this.saveForm,
                        fn: data => {
                            this.dialogLoading = false;
                            this.dialogVisible = false;
                            this.getData();
                            this.cleanSaveForm();
                        },
                        errFn: () => {
                            this.dialogLoading = false;
                        }
                    });
                }else {
                    this.dialogLoading = false;
                }
            });
        },

        editData(row) {
            if (!row.id) {
                return;
            }
            this.cleanSaveForm();
            this.$$api_erm_dnsPrivateResolutionDetail({
                data: {
                    id: row.id,
                },
                fn: data => {
                    this.saveForm = data.data;
                },
            });
            this.dialogVisible = true;
            this.dialogTitle = 'Configure Host NetCard';
        },


        delData(row) {
            if (!row.id) {
                return;
            }
            this.$confirm('Confirm?', 'warning', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning'
            }).then(() => {
                this.$$api_erm_delDnsPrivateResolution({
                    data: {
                        id: row.id,
                    },
                    fn: data => {
                        this.$message({
                            message: 'Success',
                            type: 'success'
                        });
                        this.getData();
                    },
                })
            }).catch(() => {
                //do nothing
            });
        },

        back(){
            this.$router.push({ path: '/erm/domain/dnsprivatedomain' })
        }


    }
}
