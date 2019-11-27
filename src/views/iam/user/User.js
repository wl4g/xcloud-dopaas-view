import {getDay, transDate} from 'utils/'

export default {
    name: 'user',
    data() {
        return {
            //查询条件
            searchParams: {
                userName: '',
                displayName: '',
            },

            //分页信息
            total: 0,
            pageNum: 1,
            pageSize: 10,

            //弹窗表单
            saveForm: {
                displayName: '',
                userName: '',
                oldPassword:'',
                password: '',
                email: '',
                phone: '',
                remark: '',
                roleIds: [],
                groupIds: [],
                groupNameStrs: '',

            },

            isEdit: false,

            dialogVisible: false,
            dialogTitle: '',
            dialogLoading: false,

            tableData: [],

            //rolesData
            rolesData:[],
            groupsTreeData:[],


            defaultProps: {
                children: 'children',
                label: 'displayName',
            },
            treeShow: false,


            //验证
            rules: {
                userName: [{ required: true, message: 'Please input userName', trigger: 'blur' }],
                displayName: [{ required: true, message: 'Please input displayName', trigger: 'blur' }],
                password: [{required: true, message: 'Please input password', trigger: 'blur' }],
            },

        }
    },

    mounted() {
        this.getData();
        this.getRoles();
        this.getGroupsTree();
    },

    methods: {

        onSubmit() {
            //this.loading = true;
            this.getData();
        },

        currentChange(i) {
            //this.loading = true;
            this.pageNum = i;
            this.getData();
        },

        getRoles() {
            this.$$api_iam_getRoles({
                data: {},
                fn: data => {
                    this.rolesData = data.data.data;
                }
            })
        },

        getGroupsTree() {
            this.$$api_iam_getGroupsTree({
                data: {},
                fn: data => {
                    this.groupsTreeData = data.data.data;
                }
            })
        },


        addData() {
            this.getRoles();
            this.getGroupsTree();

            this.isEdit = false;
            this.cleanSaveForm();
            this.dialogVisible = true;
            this.dialogTitle = '新增';
        },

        // 获取列表数据
        getData() {
            this.$$api_iam_userList({
                data: {
                    userName: this.searchParams.userName,
                    displayName: this.searchParams.displayName,
                    pageNum: this.pageNum,
                    pageSize: this.pageSize,
                },
                fn: data => {
                    this.total = data.data.total;
                    this.tableData = data.data.records;
                }
            })
        },

        cleanSaveForm() {
            this.saveForm = {
                displayName: '',
                userName: '',
                oldPassword:'',
                password: '',
                email: '',
                phone: '',
                remark: '',
                roleIds: [],
                groupIds: [],
                groupNameStrs: '',
            };
        },


        save() {
            this.$refs['saveForm'].validate((valid) => {
                if (valid) {
                    if(this.saveForm.oldPassword!=this.saveForm.password || this.saveForm.oldPassword==''){//need update password
                        this.saveDataWithPassword();
                    }else{//needn't update password
                        this.saveData();
                    }
                }
            })

        },

        saveDataWithPassword(){
            let loginAccount = this.saveForm.userName;
            this.$$api_iam_loginCheck({
                data: {
                    principal: loginAccount,
                    verifyType: 'VerifyWithSimpleGraph',
                },
                fn: data => {
                    if (data.data&&data.data.checkGeneral&&data.data.checkGeneral.secret) {
                        let secret = data.data.checkGeneral.secret;
                        let password = window.IAM.Crypto.rivestShamirAdleman(secret,this.saveForm.password);
                        this.saveData(password);
                    }
                },
            });
        },

        saveData(password) {
            //this.dialogLoading = true;
            this.saveForm.password = password;
            this.$$api_iam_saveUser({
                data: this.saveForm,
                fn: data => {
                    this.dialogVisible = false;
                    this.getData();
                    this.cleanSaveForm();
                }
            });
        },


        editData(row) {
            this.getRoles();
            this.getGroupsTree();

            this.cleanSaveForm();
            this.isEdit = true;
            if (!row.id) {
                return;
            }
            this.$$api_iam_userDetail({
                data: {
                    userId: row.id,
                },
                fn: data => {
                    this.saveForm = data.data.data;
                    this.saveForm.oldPassword = this.saveForm.password;
                    if (this.$refs.modulesTree && this.saveForm.groupIds instanceof Array) {
                        this.$refs.modulesTree.setCheckedKeys(this.saveForm.groupIds);
                        this.checkChange();
                    }
                }
            });
            this.dialogVisible = true;
            this.dialogTitle = '编辑';
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
                this.$$api_iam_delUser({
                    data: {
                        userId: row.id,
                    },
                    fn: data => {
                        this.$message({
                            message: 'del success',
                            type: 'success'
                        });
                        this.getData();
                    }
                })
            }).catch(() => {
                //do nothing
            });
        },


        //模块权限树展示
        focusDo() {
            if(this.$refs.modulesTree && this.saveForm.groupIds instanceof Array) this.$refs.modulesTree.setCheckedKeys(this.saveForm.groupIds)
            this.treeShow = !this.treeShow;
            let _self = this;
            this.$$lib_$(document).bind("click",function(e){
                let target  = _self.$$lib_$(e.target);
                if(target.closest(".noHide").length == 0 && _self.treeShow){
                    _self.treeShow = false;
                }
                e.stopPropagation();
            })
        },

        //模块权限树选择
        checkChange(node, selfChecked, childChecked) {
            var checkedKeys = this.$refs.modulesTree.getCheckedKeys();
            var checkedNodes = this.$refs.modulesTree.getCheckedNodes();

            let moduleNameList = [];
            checkedNodes.forEach(function(item){
                moduleNameList.push(item.displayName)
            });
            this.saveForm.groupIds = checkedKeys;
            //this.saveForm.groupNameStrs = moduleNameList.join(',');
            this.$set(this.saveForm,'groupNameStrs',moduleNameList.join(','))

        },


    }
}
